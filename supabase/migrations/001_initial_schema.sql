-- ============================================================================
-- AcademiaTrack — Initial Schema
-- Run this in the Supabase SQL Editor (or via `supabase db push`).
-- Creates enums, tables, helper functions, Row-Level Security, storage buckets,
-- realtime publication and the university-domain verification trigger.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('admin', 'instructor', 'student');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attendance_status as enum ('P', 'L', 'E', 'A');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.class_type as enum ('Lecture', 'Laboratory');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.grade_category as enum ('quiz', 'exam', 'performance_task');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.session_type as enum
    ('regular', 'makeup', 'holiday', 'suspended', 'instructor_absence');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_status as enum ('pending', 'approved', 'declined');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 2. Tables
-- ----------------------------------------------------------------------------

-- profiles: one row per auth.users row, carrying institutional identity.
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text not null unique,
  first_name     text not null default '',
  middle_name    text,
  last_name      text not null default '',
  roles          public.user_role[] not null default '{student}',
  active_view    public.user_role not null default 'student',
  department     text,
  student_number text,
  avatar_url     text,
  is_suspended   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- classes: a course section taught by exactly one instructor.
create table if not exists public.classes (
  id            uuid primary key default gen_random_uuid(),
  course_code   text not null,
  course_title  text not null,
  section       text not null,
  class_type    public.class_type not null default 'Lecture',
  units         numeric not null default 3,
  term          text not null,
  mini_term     text,
  instructor_id uuid not null references public.profiles (id) on delete cascade,
  join_code     text not null unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- class_policies: per-class configurable attendance rules (never hardcoded).
create table if not exists public.class_policies (
  class_id               uuid primary key references public.classes (id) on delete cascade,
  late_to_absent_ratio   integer not null default 3 check (late_to_absent_ratio between 1 and 5),
  max_absence_threshold  integer not null default 4 check (max_absence_threshold between 2 and 10),
  fda_enabled            boolean not null default true,
  updated_at             timestamptz not null default now()
);

-- class_schedules: recurring weekly meeting blocks.
create table if not exists public.class_schedules (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.classes (id) on delete cascade,
  day_of_week text not null check (day_of_week in
    ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  start_time  text not null,
  end_time    text not null,
  room        text not null default 'TBA'
);

-- class_sessions: concrete dated meetings (regular / makeup / holiday / ...).
create table if not exists public.class_sessions (
  id              uuid primary key default gen_random_uuid(),
  class_id        uuid not null references public.classes (id) on delete cascade,
  date            date not null,
  type            public.session_type not null default 'regular',
  title           text,
  notes           text,
  exempt_from_fda boolean not null default false,
  unique (class_id, date)
);

-- roster_students: the class roster row (may or may not be linked to an account).
create table if not exists public.roster_students (
  id             uuid primary key default gen_random_uuid(),
  class_id       uuid not null references public.classes (id) on delete cascade,
  student_number text not null,
  last_name      text not null,
  first_name     text not null,
  middle_initial text,
  program        text not null default '',
  academic_level text not null default '',
  user_id        uuid references public.profiles (id) on delete set null,
  avatar_url     text,
  created_at     timestamptz not null default now(),
  unique (class_id, student_number)
);

-- join_requests: student self-enrolment requests awaiting instructor approval.
create table if not exists public.join_requests (
  id               uuid primary key default gen_random_uuid(),
  class_id         uuid not null references public.classes (id) on delete cascade,
  requester_id     uuid references public.profiles (id) on delete set null,
  student_number   text not null,
  student_name     text not null,
  program          text not null default '',
  academic_level   text not null default '',
  photo_id_url     text,
  status           public.request_status not null default 'pending',
  rejection_reason text,
  submitted_at     timestamptz not null default now()
);

-- attendance_records: one row per student per dated session.
create table if not exists public.attendance_records (
  id           uuid primary key default gen_random_uuid(),
  class_id     uuid not null references public.classes (id) on delete cascade,
  student_id   uuid not null references public.roster_students (id) on delete cascade,
  date         date not null,
  status       public.attendance_status not null,
  note         text,
  document_url text,
  created_at   timestamptz not null default now(),
  unique (class_id, student_id, date)
);

-- excuse_requests: absence excuse slips submitted by students.
create table if not exists public.excuse_requests (
  id               uuid primary key default gen_random_uuid(),
  class_id         uuid not null references public.classes (id) on delete cascade,
  student_id       uuid not null references public.roster_students (id) on delete cascade,
  submitted_by     uuid references public.profiles (id) on delete set null,
  student_name     text not null,
  student_number   text not null,
  date             date not null,
  reason           text not null,
  document_url     text,
  status           public.request_status not null default 'pending',
  rejection_reason text,
  submitted_at     timestamptz not null default now(),
  resolved_at      timestamptz
);

-- grade_items: a graded activity (quiz / exam / performance task).
create table if not exists public.grade_items (
  id                uuid primary key default gen_random_uuid(),
  class_id          uuid not null references public.classes (id) on delete cascade,
  category          public.grade_category not null,
  title             text not null,
  max_score         numeric not null check (max_score > 0),
  weight_percentage numeric not null default 0,
  date              date not null default current_date,
  created_at        timestamptz not null default now()
);

-- student_grades: a score for a student on a grade item.
-- score IS NULL  -> ungraded / missed (distinct from a genuine zero).
create table if not exists public.student_grades (
  id            uuid primary key default gen_random_uuid(),
  grade_item_id uuid not null references public.grade_items (id) on delete cascade,
  student_id    uuid not null references public.roster_students (id) on delete cascade,
  score         numeric,
  feedback      text,
  is_missing    boolean not null default false,
  updated_at    timestamptz not null default now(),
  unique (grade_item_id, student_id)
);

-- notifications: realtime in-app notices delivered to a specific account.
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  class_id     uuid references public.classes (id) on delete set null,
  kind         text not null default 'info',
  title        text not null,
  body         text,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

-- system_policies: single-row institutional configuration managed by admins.
create table if not exists public.system_policies (
  id                     integer primary key default 1 check (id = 1),
  active_term            text not null default '1st Semester 2026-2027',
  mini_term              text,
  late_to_absent_ratio   integer not null default 3,
  max_absence_threshold  integer not null default 4,
  departments            text[] not null default '{}',
  updated_at             timestamptz not null default now()
);

-- Indexes
create index if not exists classes_instructor_idx on public.classes (instructor_id);
create index if not exists roster_class_idx on public.roster_students (class_id);
create index if not exists roster_user_idx on public.roster_students (user_id);
create index if not exists attendance_class_date_idx on public.attendance_records (class_id, date);
create index if not exists join_requests_class_idx on public.join_requests (class_id, status);
create index if not exists excuse_requests_class_idx on public.excuse_requests (class_id, status);
create index if not exists grade_items_class_idx on public.grade_items (class_id);
create index if not exists student_grades_student_idx on public.student_grades (student_id);
create index if not exists notifications_recipient_idx on public.notifications (recipient_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 3. Helper functions
-- ----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create or replace function public.current_roles()
returns public.user_role[]
language sql stable security definer set search_path = public as $$
  select coalesce((select roles from public.profiles where id = auth.uid()), '{}');
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select 'admin' = any(roles) from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_class_instructor(p_class_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.classes c
    where c.id = p_class_id and c.instructor_id = auth.uid()
  );
$$;

-- A class member is the instructor, an admin, or an enrolled student.
create or replace function public.is_class_member(p_class_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin()
    or public.is_class_instructor(p_class_id)
    or exists (
      select 1 from public.roster_students rs
      where rs.class_id = p_class_id and rs.user_id = auth.uid()
    );
$$;

-- True when the roster row belongs to the signed-in student account.
create or replace function public.is_own_roster_row(p_student_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.roster_students rs
    where rs.id = p_student_id and rs.user_id = auth.uid()
  );
$$;

-- Resolves a class from its public join code for the enrolment flow. A student
-- is not yet a class member, so the plain select policy would hide the row;
-- this security-definer lookup deliberately exposes only the join-code match.
create or replace function public.lookup_class_by_join_code(p_code text)
returns table (
  id            uuid,
  course_code   text,
  course_title  text,
  section       text,
  class_type    public.class_type,
  units         integer,
  term          text,
  mini_term     text,
  instructor_id uuid,
  join_code     text,
  created_at    timestamptz,
  updated_at    timestamptz
)
language sql stable security definer set search_path = public as $$
  select c.id, c.course_code, c.course_title, c.section, c.class_type,
         c.units, c.term, c.mini_term, c.instructor_id, c.join_code,
         c.created_at, c.updated_at
  from public.classes c
  where c.join_code = upper(trim(p_code));
$$;

grant execute on function public.lookup_class_by_join_code(text) to authenticated;

-- ----------------------------------------------------------------------------
-- 4. Auth: profile provisioning + strict university-domain verification
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role   text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  v_email  text := lower(coalesce(new.email, ''));
  v_domain text := 'universityofbohol.edu.ph';
  v_caller_role text := coalesce(auth.role(), '');
begin
  -- Only administrative provisioning (running via service_role key or direct admin SQL)
  -- may create accounts with instructor or admin roles. Self-service sign-ups are strictly forced to student.
  if v_caller_role <> 'service_role' and v_role in ('instructor', 'admin') then
    v_role := 'student';
  end if;

  -- Students may only register with the official university email domain.
  if v_role = 'student' and v_email not like '%@' || v_domain then
    raise exception
      'Student registration is restricted to the official university email domain (@%).',
      v_domain using errcode = 'check_violation';
  end if;

  insert into public.profiles (
    id, email, first_name, middle_name, last_name,
    roles, active_view, department, student_number, avatar_url
  ) values (
    new.id,
    v_email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'middle_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    case
      when v_role in ('admin', 'instructor', 'student')
        then array[v_role::public.user_role]
      else array['student'::public.user_role]
    end,
    case when v_role in ('admin', 'instructor', 'student')
      then v_role::public.user_role else 'student'::public.user_role end,
    nullif(new.raw_user_meta_data ->> 'department', ''),
    nullif(new.raw_user_meta_data ->> 'student_number', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at triggers
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists classes_touch on public.classes;
create trigger classes_touch before update on public.classes
  for each row execute function public.touch_updated_at();

drop trigger if exists class_policies_touch on public.class_policies;
create trigger class_policies_touch before update on public.class_policies
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 5. Realtime notification fan-out (grades + attendance)
-- ----------------------------------------------------------------------------

create or replace function public.notify_student_grade()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_user_id  uuid;
  v_class_id uuid;
  v_title    text;
begin
  select rs.user_id, rs.class_id into v_user_id, v_class_id
  from public.roster_students rs where rs.id = new.student_id;

  if v_user_id is null then
    return new;
  end if;

  select gi.title into v_title from public.grade_items gi where gi.id = new.grade_item_id;

  insert into public.notifications (recipient_id, class_id, kind, title, body)
  values (
    v_user_id, v_class_id, 'grade',
    'New grade recorded',
    coalesce(v_title, 'A grade item') || ' has been recorded for you.'
  );

  return new;
end $$;

drop trigger if exists student_grades_notify on public.student_grades;
create trigger student_grades_notify
  after insert or update of score on public.student_grades
  for each row execute function public.notify_student_grade();

create or replace function public.notify_attendance()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid;
begin
  select rs.user_id into v_user_id
  from public.roster_students rs where rs.id = new.student_id;

  if v_user_id is null then
    return new;
  end if;

  insert into public.notifications (recipient_id, class_id, kind, title, body)
  values (
    v_user_id, new.class_id, 'attendance',
    'Attendance updated',
    'Your attendance for ' || to_char(new.date, 'Mon DD, YYYY') ||
    ' was marked "' || new.status || '".'
  );

  return new;
end $$;

drop trigger if exists attendance_notify on public.attendance_records;
create trigger attendance_notify
  after insert on public.attendance_records
  for each row execute function public.notify_attendance();

-- ----------------------------------------------------------------------------
-- 6. Row-Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.classes           enable row level security;
alter table public.class_policies    enable row level security;
alter table public.class_schedules   enable row level security;
alter table public.class_sessions    enable row level security;
alter table public.roster_students   enable row level security;
alter table public.join_requests     enable row level security;
alter table public.attendance_records enable row level security;
alter table public.excuse_requests   enable row level security;
alter table public.grade_items       enable row level security;
alter table public.student_grades    enable row level security;
alter table public.notifications     enable row level security;
alter table public.system_policies   enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- classes -------------------------------------------------------------------
drop policy if exists classes_select on public.classes;
create policy classes_select on public.classes
  for select using (public.is_class_member(id) or instructor_id = auth.uid());

drop policy if exists classes_insert on public.classes;
create policy classes_insert on public.classes
  for insert with check (instructor_id = auth.uid());

drop policy if exists classes_update on public.classes;
create policy classes_update on public.classes
  for update using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());

drop policy if exists classes_delete on public.classes;
create policy classes_delete on public.classes
  for delete using (instructor_id = auth.uid());

-- class_policies ------------------------------------------------------------
drop policy if exists class_policies_select on public.class_policies;
create policy class_policies_select on public.class_policies
  for select using (public.is_class_member(class_id));

drop policy if exists class_policies_write on public.class_policies;
create policy class_policies_write on public.class_policies
  for all using (public.is_class_instructor(class_id))
  with check (public.is_class_instructor(class_id));

-- class_schedules -----------------------------------------------------------
drop policy if exists class_schedules_select on public.class_schedules;
create policy class_schedules_select on public.class_schedules
  for select using (public.is_class_member(class_id));

drop policy if exists class_schedules_write on public.class_schedules;
create policy class_schedules_write on public.class_schedules
  for all using (public.is_class_instructor(class_id))
  with check (public.is_class_instructor(class_id));

-- class_sessions ------------------------------------------------------------
drop policy if exists class_sessions_select on public.class_sessions;
create policy class_sessions_select on public.class_sessions
  for select using (public.is_class_member(class_id));

drop policy if exists class_sessions_write on public.class_sessions;
create policy class_sessions_write on public.class_sessions
  for all using (public.is_class_instructor(class_id))
  with check (public.is_class_instructor(class_id));

-- roster_students -----------------------------------------------------------
drop policy if exists roster_select on public.roster_students;
create policy roster_select on public.roster_students
  for select using (public.is_class_member(class_id));

-- Only the assigned instructor may add / edit / remove roster rows.
drop policy if exists roster_write on public.roster_students;
create policy roster_write on public.roster_students
  for all using (public.is_class_instructor(class_id))
  with check (public.is_class_instructor(class_id));

-- join_requests -------------------------------------------------------------
drop policy if exists join_requests_select on public.join_requests;
create policy join_requests_select on public.join_requests
  for select using (public.is_class_instructor(class_id) or requester_id = auth.uid());

drop policy if exists join_requests_insert on public.join_requests;
create policy join_requests_insert on public.join_requests
  for insert with check (requester_id = auth.uid() or requester_id is null);

drop policy if exists join_requests_update on public.join_requests;
create policy join_requests_update on public.join_requests
  for update using (public.is_class_instructor(class_id))
  with check (public.is_class_instructor(class_id));

-- attendance_records --------------------------------------------------------
-- Strict academic isolation: admins are NOT granted write access.
drop policy if exists attendance_select on public.attendance_records;
create policy attendance_select on public.attendance_records
  for select using (
    public.is_admin()
    or public.is_class_instructor(class_id)
    or public.is_own_roster_row(student_id)
  );

drop policy if exists attendance_write on public.attendance_records;
create policy attendance_write on public.attendance_records
  for all using (public.is_class_instructor(class_id))
  with check (public.is_class_instructor(class_id));

-- excuse_requests -----------------------------------------------------------
drop policy if exists excuse_select on public.excuse_requests;
create policy excuse_select on public.excuse_requests
  for select using (public.is_class_instructor(class_id) or submitted_by = auth.uid());

drop policy if exists excuse_insert on public.excuse_requests;
create policy excuse_insert on public.excuse_requests
  for insert with check (
    exists (
      select 1 from public.roster_students rs
      where rs.id = student_id and rs.user_id = auth.uid()
    )
  );

drop policy if exists excuse_update on public.excuse_requests;
create policy excuse_update on public.excuse_requests
  for update using (public.is_class_instructor(class_id))
  with check (public.is_class_instructor(class_id));

-- grade_items ---------------------------------------------------------------
-- Strict academic isolation: admins are NOT granted write access.
drop policy if exists grade_items_select on public.grade_items;
create policy grade_items_select on public.grade_items
  for select using (public.is_class_member(class_id));

drop policy if exists grade_items_write on public.grade_items;
create policy grade_items_write on public.grade_items
  for all using (public.is_class_instructor(class_id))
  with check (public.is_class_instructor(class_id));

-- student_grades ------------------------------------------------------------
drop policy if exists student_grades_select on public.student_grades;
create policy student_grades_select on public.student_grades
  for select using (
    public.is_admin()
    or public.is_own_roster_row(student_id)
    or exists (
      select 1 from public.grade_items gi
      where gi.id = grade_item_id and public.is_class_instructor(gi.class_id)
    )
  );

drop policy if exists student_grades_write on public.student_grades;
create policy student_grades_write on public.student_grades
  for all using (
    exists (
      select 1 from public.grade_items gi
      where gi.id = grade_item_id and public.is_class_instructor(gi.class_id)
    )
  )
  with check (
    exists (
      select 1 from public.grade_items gi
      where gi.id = grade_item_id and public.is_class_instructor(gi.class_id)
    )
  );

-- notifications -------------------------------------------------------------
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select using (recipient_id = auth.uid());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- system_policies -----------------------------------------------------------
drop policy if exists system_policies_select on public.system_policies;
create policy system_policies_select on public.system_policies
  for select using (auth.uid() is not null);

drop policy if exists system_policies_write on public.system_policies;
create policy system_policies_write on public.system_policies
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. Storage buckets (student ID photos + excuse slips)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('student-ids', 'student-ids', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('excuse-documents', 'excuse-documents', false)
on conflict (id) do nothing;

drop policy if exists student_ids_read on storage.objects;
create policy student_ids_read on storage.objects
  for select using (bucket_id = 'student-ids' and auth.uid() is not null);

drop policy if exists student_ids_write on storage.objects;
create policy student_ids_write on storage.objects
  for insert with check (bucket_id = 'student-ids' and auth.uid() is not null);

drop policy if exists excuse_docs_read on storage.objects;
create policy excuse_docs_read on storage.objects
  for select using (bucket_id = 'excuse-documents' and auth.uid() is not null);

drop policy if exists excuse_docs_write on storage.objects;
create policy excuse_docs_write on storage.objects
  for insert with check (bucket_id = 'excuse-documents' and auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- 8. Realtime
-- ----------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when undefined_object then null; when duplicate_object then null; end $$;

do $$
begin
  alter publication supabase_realtime add table public.attendance_records;
exception when undefined_object then null; when duplicate_object then null; end $$;

do $$
begin
  alter publication supabase_realtime add table public.student_grades;
exception when undefined_object then null; when duplicate_object then null; end $$;

do $$
begin
  alter publication supabase_realtime add table public.excuse_requests;
exception when undefined_object then null; when duplicate_object then null; end $$;

do $$
begin
  alter publication supabase_realtime add table public.join_requests;
exception when undefined_object then null; when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 9. Seed the institutional policy singleton (no demo/mock academic data)
-- ----------------------------------------------------------------------------
insert into public.system_policies (id, departments)
values (1, array[
  'Graduate School: GS',
  'College of Law: COL',
  'College of Business and Accountancy: CBA',
  'College of Engineering, Technology, Architecture, and Fine Arts: CETAFA',
  'College of Arts, Sciences, and Education: CASE',
  'College of Criminal Justice: CCJ',
  'College of Hospitality Management, Tourism, and Nutrition: CHMTN',
  'College of Allied Health Sciences: CAHS',
  'College of Physical Therapy and Occupational Therapy: CPTOT',
  'College of Pharmacy: COP',
  'Victoriano D. Tirol Advanced Learning Center: VDTALC'
])
on conflict (id) do update
set departments = excluded.departments;
