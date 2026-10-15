-- ==============================================================================
-- ACADEMIATRACK: DIGITAL CLASS RECORD & ATTENDANCE MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL SCHEMA WITH STRICT ACADEMIC ROW-LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    student_id_number TEXT UNIQUE,
    department TEXT,
    program TEXT,
    year_level INT,
    mobile_number TEXT,
    alt_email TEXT,
    photo_url TEXT,
    roles TEXT[] NOT NULL DEFAULT ARRAY['student'],
    is_onboarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLASSES
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID NOT NULL REFERENCES public.profiles(id),
    course_code TEXT NOT NULL,
    course_title TEXT NOT NULL,
    section TEXT NOT NULL,
    class_type TEXT NOT NULL CHECK (class_type IN ('Lecture', 'Laboratory', 'Hybrid')),
    units INT DEFAULT 3,
    academic_term TEXT NOT NULL,
    mini_term TEXT NOT NULL,
    join_code TEXT UNIQUE NOT NULL,
    late_conversion_threshold INT DEFAULT 3,
    fda_absence_threshold_hours INT DEFAULT 6,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLASS SCHEDULES (Dynamic Room & Time per day)
CREATE TABLE IF NOT EXISTS public.class_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room TEXT NOT NULL DEFAULT 'TBA'
);

-- 4. ROSTER ENTRIES (5-Column Pre-populated list)
CREATE TABLE IF NOT EXISTS public.roster_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    sequence_number INT NOT NULL,
    student_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    program TEXT NOT NULL,
    year_level INT NOT NULL,
    linked_user_id UUID REFERENCES public.profiles(id),
    photo_url TEXT,
    enrollment_status TEXT DEFAULT 'enrolled'
);

-- 5. JOIN REQUESTS
CREATE TABLE IF NOT EXISTS public.join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_user_id UUID NOT NULL REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    decline_reason TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ATTENDANCE SESSIONS & RECORDS
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    session_type TEXT DEFAULT 'regular' CHECK (session_type IN ('regular', 'make-up', 'holiday', 'suspended', 'instructor-absence')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    roster_entry_id UUID NOT NULL REFERENCES public.roster_entries(id) ON DELETE CASCADE,
    status CHAR(1) NOT NULL CHECK (status IN ('P', 'L', 'E', 'A')),
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (session_id, roster_entry_id)
);

-- 7. GRADE ACTIVITIES & SCORES
CREATE TABLE IF NOT EXISTS public.grade_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('Quizzes', 'Exams', 'Performance Tasks')),
    name TEXT NOT NULL,
    description TEXT,
    max_score NUMERIC(5,2) NOT NULL,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS public.grade_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES public.grade_activities(id) ON DELETE CASCADE,
    roster_entry_id UUID NOT NULL REFERENCES public.roster_entries(id) ON DELETE CASCADE,
    score NUMERIC(5,2),
    is_missing BOOLEAN DEFAULT FALSE,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (activity_id, roster_entry_id)
);

-- 8. EXCUSE REQUESTS
CREATE TABLE IF NOT EXISTS public.excuse_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_record_id UUID NOT NULL REFERENCES public.attendance_records(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id),
    reason TEXT NOT NULL,
    document_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    instructor_remarks TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- STRICT ACADEMIC BARRIER: ADMINS CANNOT EDIT GRADES OR ATTENDANCE
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roster_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excuse_requests ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Instructor of Class
CREATE OR REPLACE FUNCTION public.is_instructor_of_class(class_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = class_uuid AND instructor_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attendance Records: Instructors can INSERT/UPDATE, Students can SELECT own records, Admins BLOCKED from mutating
CREATE POLICY "Instructors manage attendance for their classes"
ON public.attendance_records
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.attendance_sessions s
    JOIN public.classes c ON s.class_id = c.id
    WHERE s.id = attendance_records.session_id AND c.instructor_id = auth.uid()
  )
);

CREATE POLICY "Students view their own attendance records"
ON public.attendance_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.roster_entries r
    WHERE r.id = attendance_records.roster_entry_id AND r.linked_user_id = auth.uid()
  )
);

-- Grade Scores: Instructors can INSERT/UPDATE, Students can SELECT own scores, Admins BLOCKED from mutating
CREATE POLICY "Instructors manage grades for their classes"
ON public.grade_scores
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.grade_activities a
    JOIN public.classes c ON a.class_id = c.id
    WHERE a.id = grade_scores.activity_id AND c.instructor_id = auth.uid()
  )
);

CREATE POLICY "Students view their own grade scores"
ON public.grade_scores
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.roster_entries r
    WHERE r.id = grade_scores.roster_entry_id AND r.linked_user_id = auth.uid()
  )
);
