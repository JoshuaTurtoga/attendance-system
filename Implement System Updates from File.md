# Implement System Updates from File

> **Workspace:** c:\Users\joshu\Documents\GitHub\attendance-system

---

**User**

Implement the updates for the system by reading `/c:/Users/joshu/Documents/GitHub/attendance-system/UPDATE2.md`

**Assistant**

I'll explore the codebase to understand the current state before implementing.

This is a large task. Let me explore the key files to understand the current architecture.

Let me read the core type definitions and launch parallel exploration.

The architecture is currently all client-side mock. Let me map the full data flow with parallel exploration.

I'll thoroughly explore the codebase and document the complete data/state architecture. Let me start by examining the directory structure and then systematically analyze each file.

I'll search comprehensively for all hardcoded mock data across the codebase. Let me run multiple searches in parallel.

I'll explore the codebase systematically to gather all the information you need. Let me start by reading the key files in parallel.

Now let me read the test files, globals.css, and check for empty state components.

Let me read the key mock data files and search for additional patterns:

Let me continue searching for more mock data patterns and read the remaining relevant files:

Let me read the remainder of `student-hub.tsx` and search for more files:

Now I have gathered comprehensive information about all hardcoded mock data in the codebase. Let me compile the complete inventory.

---

## Complete Inventory of Hardcoded Mock/Demo/Placeholder Data

### 1. **Primary Mock Data Source File**

**File:** `c:\Users\joshu\Documents\GitHub\attendance-system\src\lib\roster\mock-roster.ts`

This file exports the following mock data constants:

| Constant | Description |
|----------|-------------|
| `DEFAULT_ROSTER` | 5 hardcoded students (stud_01-05) with names (Sofia Aquino, Clara Bautista, Marcus Chen, Juan Dela Cruz, Gabriel Zubiri), student numbers, programs (BSCS/BSIT), and Unsplash avatar URLs |
| `DEFAULT_JOIN_REQUESTS` | 3 pending join requests (req_01-03) with photo IDs, student info, and Unsplash photo URLs |
| `DEFAULT_EXCUSE_REQUESTS` | 2 excuse requests (exc_01-02) for Gabriel Zubiri and Marcus Chen with Unsplash document images |
| `DEFAULT_GRADE_ITEMS` | 4 grade items (gi_q1, gi_q2, gi_pt1, gi_ex1) - quizzes, performance task, and midterm exam |
| `DEFAULT_STUDENT_GRADES` | 20 student-grade records mapping students to grade items with scores (including a null score for stud_05) |
| `INITIAL_ATTENDANCE_RECORDS` | 17 attendance records across 2 sessions (2026-10-09, 2026-10-14) with status P/L/E/A |
| `INITIAL_SESSION_DATES` | Array `["2026-10-09", "2026-10-14", "2026-10-16"]` |
| `INITIAL_SESSION_TYPES` | Record mapping dates to "regular" session type |

**Unsplash URLs in this file:**
- `images.unsplash.com/photo-1534528741775-53994a69daeb` (Sofia Aquino avatar)
- `images.unsplash.com/photo-1517841905240-472988babdf9` (Clara Bautista avatar)
- `images.unsplash.com/photo-1539571696357-5a69c17a67c6` (Marcus Chen avatar)
- `images.unsplash.com/photo-1507003211169-0a1dd7228f2d` (Juan Dela Cruz avatar)
- `images.unsplash.com/photo-1500648767791-00dcc994a43e` (Gabriel Zubiri avatar)
- `images.unsplash.com/photo-1584515979956-d9f6e5d09982` (excuse document - hospital)
- `images.unsplash.com/photo-1557804506-669a67965ba0` (excuse document - ICPC)

---

### 2. **Demo User Personas**

**File:** `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\features\\auth\\auth-context.tsx`

| Constant | Description |
|----------|-------------|
| `DEMO_USERS` | 3 demo personas with Unsplash avatars: `dual_instructor_admin`, `instructor_only`, `student_only` |
| Demo Password | `"Academia2026!"` (from auth-engine.ts, line 12) |

**Demo personas include:**
- **dual_instructor_admin**: Arthur Pendelton (arthur.pendelton@university.edu), roles: instructor+admin
- **instructor_only**: Elena Vance (elena.vance@university.edu), role: instructor  
- **student_only**: Marcus Chen (marcus.chen@student.university.edu), role: student

**Unsplash URLs in this file:**
- `images.unsplash.com/photo-1534528741775-53994a69daeb` (Arthur Pendelton)
- `images.unsplash.com/photo-1573496359142-b8d87734a5a2` (Elena Vance)
- `images.unsplash.com/photo-1539571696357-5a69c17a67c6` (Marcus Chen)

---

### 3. **Hardcoded Data in Admin Hub**

**File:** `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\admin-hub.tsx`

| Data | Description |
|------|-------------|
| `INITIAL_ADMIN_USERS` | Array of 7 hardcoded users including 3 DEMO_USERS and 4 additional users with Unsplash avatars (usr_inst_04, usr_stud_05, usr_stud_06, usr_adm_07) |
| `INITIAL_ADMIN_CLASSES` | Array of 5 hardcoded academic classes (cls_01-05) including STAS 101, CS 312, IT 221, ENG 201, MATH 104 with join codes |

**Additional Unsplash URLs in this file:**
- `images.unsplash.com/photo-1507003211169-0a1dd7228f2d` (Robert Reyes)
- `images.unsplash.com/photo-1494790108377-be9c29b29330` (Maria Santos)
- `images.unsplash.com/photo-1544005313-94ddf0286df2` (Sarah Jenkins)

---

### 4. **Component Files Using Mock Data**

| File | Mock Data Imported | Usage |
|------|-------------------|-------|
| `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\class-attendance-sheet.tsx` | `DEFAULT_ROSTER`, `DEFAULT_EXCUSE_REQUESTS` | Lines 14, 52-66 (local copies of INITIAL_* constants), 88, 129 |
| `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\class-grades-matrix.tsx` | `DEFAULT_ROSTER`, `DEFAULT_GRADE_ITEMS`, `DEFAULT_STUDENT_GRADES` | Lines 13-16, 60-64 |
| `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\class-roster-table.tsx` | `DEFAULT_ROSTER`, `DEFAULT_JOIN_REQUESTS` | Lines 25, 36, 39 |
| `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\class-workspace.tsx` | `DEFAULT_ROSTER`, `DEFAULT_GRADE_ITEMS`, `DEFAULT_STUDENT_GRADES`, `INITIAL_ATTENDANCE_RECORDS`, `INITIAL_SESSION_DATES`, `INITIAL_SESSION_TYPES` | Lines 15-21, 60-70, 73 (hardcoded todayIso = "2026-10-16") |
| `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\student-hub.tsx` | `DEFAULT_GRADE_ITEMS`, `DEFAULT_STUDENT_GRADES`, `INITIAL_ATTENDANCE_RECORDS`, `DEFAULT_EXCUSE_REQUESTS` | Lines 14-18, 116-121 |

---

### 5. **Files Using DEMO_USERS**

| File | Usage |
|------|-------|
| `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\admin-hub.tsx` | Import at line 12; uses DEMO_USERS.dual_instructor_admin, .instructor_only, .student_only at lines 47-49 |
| `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\auth-login-screen.tsx` | Import at line 4; uses at line 127 to render demo account buttons; uses demoPassword at line 15 |
| `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\sidebar.tsx` | Import at line 5; uses at line 383-390 for persona switching menu |

---

### 6. **Placeholder Supabase Configuration**

**Files:** `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\lib\\supabase\\client.ts` and `server.ts`

| Lines | Placeholder Values |
|-------|-------------------|
| 10-12 | `https://placeholder-project.supabase.co` and `placeholder-anon-key` |

---

### 7. **Hardcoded Test Data in tests/ Directory**

**File:** `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\tests\\student-portal.test.ts`
- Lines 17-20: Mock grade items (g1-g4) with course code "STAS"
- Lines 24-27: Mock student grades for stud_01
- Lines 31-33: Mock attendance records
- Lines 92-100: Mock academic class with courseCode "STAS", joinCode "STAS01"

**File:** `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\tests\\smart-matching.test.ts`
- Lines 12-44: Mock roster students (stud_01, stud_02, stud_03)
- Lines 111-112: Mock user ID "usr_stud_marcus"

**File:** `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\tests\\session-and-excuse-engine.test.ts`
- Lines 60-61, 74-75, 98-99: Mock classId "cls_01" and studentIds "stud_05", "stud_03"

**File:** `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\tests\\schedule-calendar.test.ts`
- Lines 13-14: Mock class with courseCode "STAS"
- Lines 82, 87: Assertions checking courseCode "STAS"

**File:** `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\tests\\gradebook-engine.test.ts`
- Lines 14-21: Mock grade items (item_q1, item_q2, item_ex1, item_pt1)
- Lines 27-40: Mock student grades for stud_01 and stud_02
- Lines 110-111: Mock roster students

**File:** `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\tests\\roster-engine.test.ts`
- Lines 71, 80, 89: Mock classId "cls_01"

**File:** `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\tests\\cross-module-sync.test.ts`
- Lines 191, 221: courseCode "STAS"

---

### 8. **Additional Unsplash Image URLs (for ID photos and documents)**

**File:** `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\student-join-class-modal.tsx`
- Line 72: `images.unsplash.com/photo-1534528741775-53994a69daeb` (student photo ID)

**File:** `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\student-hub.tsx`
- Line 146: `images.unsplash.com/photo-1534528741775-53994a69daeb` (photo ID in join request)

---

### 9. **Hardcoded Dates**

| File | Hardcoded Date |
|------|----------------|
| `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\class-workspace.tsx` | Line 73: `todayIso = "2026-10-16"` |
| `c:\Users\\joshu\\Documents\\GitHub\\attendance-system\\src\\components\\student-hub.tsx` | Line 297: `Friday, October 16, 2026` |

---

### 10. **Summary of Mock Data Consumers**

All the following files directly import and use mock data constants:

1. `src/lib/roster/mock-roster.ts` - **SOURCE FILE** (exports all DEFAULT_* and INITIAL_* constants)
2. `src/features/auth/auth-context.tsx` - Exports DEMO_USERS, uses DEMO_PASSWORD
3. `src/lib/auth/auth-engine.ts` - Exports DEMO_PASSWORD = "Academia2026!"
4. `src/components/admin-hub.tsx` - Uses DEMO_USERS and hardcodes INITIAL_ADMIN_USERS and INITIAL_ADMIN_CLASSES
5. `src/components/class-attendance-sheet.tsx` - Uses DEFAULT_ROSTER, DEFAULT_EXCUSE_REQUESTS
6. `src/components/class-grades-matrix.tsx` - Uses DEFAULT_ROSTER, DEFAULT_GRADE_ITEMS, DEFAULT_STUDENT_GRADES
7. `src/components/class-roster-table.tsx` - Uses DEFAULT_ROSTER, DEFAULT_JOIN_REQUESTS
8. `src/components/class-workspace.tsx` - Uses DEFAULT_ROSTER, DEFAULT_GRADE_ITEMS, DEFAULT_STUDENT_GRADES, INITIAL_ATTENDANCE_RECORDS, INITIAL_SESSION_DATES, INITIAL_SESSION_TYPES
9. `src/components/student-hub.tsx` - Uses DEFAULT_GRADE_ITEMS, DEFAULT_STUDENT_GRADES, INITIAL_ATTENDANCE_RECORDS, DEFAULT_EXCUSE_REQUESTS
10. `src/components/auth-login-screen.tsx` - Uses DEMO_USERS
11. `src/components/sidebar.tsx` - Uses DEMO_USERS

---

This inventory provides a complete reference for purging all mock data from the codebase for a production-ready clean slate.

Now let me read the auth-context to complete the documentation:

Now I have gathered all the necessary information. Let me compile the comprehensive documentation report.

---

## Documentation Report: Authentication/Sign-up UI Flow and Test Suite

### 1. AUTHENTICATION COMPONENTS ANALYSIS

---

#### **1.1 AuthPortal** (`c:\Users\joshu\Documents\GitHub\attendance-system\src\components\auth-portal.tsx`)

**What it renders:**
- Public authentication entry point that switches between landing page and auth screens
- Uses `authScreen` state from `useAuth()` context to determine which screen to show

**Navigation states (AuthScreen type):**
- `"landing"` - Landing page (default)
- `"login"` - Login screen
- `"register"` - Student registration screen
- `"forgot"` - OTP password reset screen

**Auth-context functions called:**
- `useAuth()` - reads `authScreen` state

---

#### **1.2 AuthLoginScreen** (`c:\Users\joshu\Documents\GitHub\attendance-system\src\components\auth-login-screen.tsx`)

**What it renders:**
- Login form within `AuthShell` wrapper
- "Secure Access" eyebrow, "Sign in to your portal" title
- Demo accounts section for testing

**Form fields:**
| Field | Type | Required | Placeholder | Icon |
|-------|------|----------|-------------|------|
| University Email | email | Yes | you@university.edu | Mail |
| Password | password | Yes | Enter your password | Lock |

**Validation performed:**
- Email format validated via `validateEmail()` from auth-engine
- Password presence checked (HTML5 required)
- Shows/hide password toggle using `Eye`/`EyeOff` icons

**Error messages displayed:**
- "Unable to sign in." (default)
- Specific errors from `signIn()` result

**Auth-context functions called:**
- `useAuth()` - gets `signIn`, `goToScreen`, `demoPassword`
- `signIn(email, password)` - validates credentials, returns `{ok, error}`
- `goToScreen("register")` - navigates to registration
- `goToScreen("forgot")` - navigates to password reset
- `goToScreen("landing")` - back to landing

**Demo accounts section:**
Renders `DEMO_USERS` entries with:
- Name, email, role badges
- Click to auto-fill credentials
- Uses `fillDemoAccount()` helper

---

#### **1.3 AuthRegisterScreen** (`c:\Users\joshu\Documents\GitHub\attendance-system\src\components\auth-register-screen.tsx`)

**What it renders:**
- Student registration form within `AuthShell`
- "Student Registration" eyebrow, "Create your student account" title
- Subtitle: "Register with your university details. Faculty accounts are provisioned by the administration."

**Form fields:**
| Field | Type | Required | Placeholder | Icon |
|-------|------|----------|-------------|------|
| First Name | text | Yes | Sofia | User |
| Last Name | text | Yes | Aquino | User |
| Middle Name (optional) | text | No | B. | - |
| Student Number | text | Yes | 2024-10492 | Hash |
| University Email | email | Yes | you@student.university.edu | Mail |
| Academic Department | select | Yes | - | Building2 |
| Password | password | Yes | Min. 8 characters | Lock |
| Confirm Password | password | Yes | Re-enter password | Lock |

**Department options (DEPARTMENTS array):**
- College of Computer Studies
- Computer Science & Engineering
- Information Technology
- College of Science
- College of Engineering
- Mathematics & Statistics
- Humanities & Social Sciences

**Validation performed:**
- Student number format: `validateStudentNumber(studentNumber)` - must match `YYYY-NNNNN` format
- Password match: `password !== confirmPassword`
- Email validation: `validateEmail()` via auth-engine
- Password validation: `validatePassword()` - min 8 chars, must include letters and numbers

**Error messages displayed (EXACT STRINGS):**
1. `"Student number must follow the YYYY-NNNNN format (e.g. 2024-10492)."` - invalid student number format
2. `"Passwords do not match."` - password/confirm mismatch
3. `"Unable to create your account."` - generic registration failure

**Auth-context functions called:**
- `useAuth()` - gets `registerStudent`, `goToScreen`
- `registerStudent({firstName, middleName, lastName, studentNumber, email, password, department})` - creates student account
- `goToScreen("login")` - navigates to login after successful registration
- `goToScreen("landing")` - back to landing page

---

#### **1.4 AuthOtpResetScreen** (`c:\Users\joshu\Documents\GitHub\attendance-system\src\components\auth-otp-reset-screen.tsx`)

**What it renders:**
- 3-step password reset flow: email -> OTP verification -> new password
- Step indicator with numbered circles and progress line
- "Account Recovery" eyebrow, "Reset your password" title

**Steps:**

**Step 1: Email (`"email"`)**
- Field: University Email (type=email, placeholder="you@university.edu")
- Button: "Send Verification Code"
- Calls: `requestPasswordResetOtp(email)`

**Step 2: OTP Verification (`"otp"`)**
- Shows masked email notice: "A 6-digit verification code was sent to {maskedEmail}."
- Demo mode shows issued OTP in amber banner: "Demonstration code (no email is sent): {code}"
- Field: Verification Code (inputMode=numeric, maxLength=6, placeholder="000000")
- Only digits allowed (strips non-numeric via `replace(/\D/g, "")`)
- Button: "Verify Code"
- Back link: "Use a different email"
- Calls: `verifyPasswordResetOtp(email, otp)`

**Step 3: New Password (`"password"`)**
- Fields:
  - New Password (type=password, placeholder="Min. 8 characters")
  - Confirm New Password (type=password, placeholder="Re-enter new password")
- Button: "Set New Password"
- Calls: `resetPassword(email, otp, password)`

**Error messages displayed:**
- "Unable to send a verification code."
- "Unable to verify the code."
- "Passwords do not match." (client-side check)
- "Unable to reset your password."

**Auth-context functions called:**
- `useAuth()` - gets all OTP/password reset functions
- `requestPasswordResetOtp(email)` - sends OTP, returns `{ok, error, otp}`
- `verifyPasswordResetOtp(email, code)` - validates OTP
- `resetPassword(email, code, newPassword)` - updates password
- `goToScreen("login")` - returns to login after success

---

#### **1.5 AuthShell** (`c:\Users\joshu\Documents\GitHub\attendance-system\src\components\auth-shell.tsx`)

**What it renders:**
- Shared responsive layout frame for all public authentication screens
- Two-column layout on large screens (lg+): brand rail (44% width) + form column
- Mobile: single column with compact brand header

**Brand Rail (lg+ only):**
- Background: `#7C1D26` (Academic Garnet)
- Decorative circles with white/black transparency
- Logo: "AcademiaTrack" with GraduationCap icon
- Tagline: "Digital Class Record & Attendance"
- University Academic Suite badge
- Headline: "One record of truth for every class session."
- Feature list (attendance, gradebook, privacy lock, FDA rules, roster sync)
- Footer: © year AcademiaTrack

**Form Column:**
- Mobile brand header (lg:hidden)
- Eyebrow text (text-[11px] uppercase tracking-wider text-[#7C1D26])
- Title (text-2xl font-bold text-zinc-950)
- Subtitle (text-sm text-zinc-500)
- Children (form content)
- Footer (centered text-xs text-zinc-500)

**Exported components:**

**AuthField** - Reusable form input with icon:
```tsx
interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
}
```
- Label with text-xs font-semibold text-zinc-700
- Optional left icon (positioned absolute)
- Input with rounded-xl border border-zinc-200, focus:ring-[#7C1D26]
- Optional hint text below

**AuthErrorBanner** - Error display:
```tsx
{ message?: string | null }
```
- Red bg (bg-rose-50), border-rose-200, text-rose-800
- AlertCircle icon
- Hidden when no message

---

#### **1.6 LandingPage** (`c:\Users\joshu\Documents\GitHub\attendance-system\src\components\landing-page.tsx`)

**What it renders:**
- Full landing/marketing page for unauthenticated visitors
- Sticky top navigation bar with Sign In / Create Account buttons

**Header (glass-nav):**
- Logo: "AcademiaTrack" with GraduationCap icon
- Sign In button (text only)
- Create Account button (garnet bg)

**Hero Section:**
- Badge: "Multi-Role Academic Platform" with Sparkles icon
- Headline: "Digitize your class records and daily attendance."
- Subhead: Unifies roll-call, grading, real-time standing
- CTA buttons: "Enter the Portal" (primary) / "Student Registration" (secondary)
- Trust badges: Role-based access, Academic data isolation, Real-time sync icons

**Preview Card (decorative):**
- Shows mock attendance session UI
- STAS 101 • E106-R, date badge
- Attendance stats: Present 31, Late 2, Excused 1, Absent 1
- Student list with status pills

**Features Section (Platform Capabilities):**
6 feature cards with icons:
1. Rapid Roll-Call (CalendarCheck) - P/L/E/A statuses
2. Categorized Gradebook (TrendingUp) - blank-vs-zero handling
3. Real-Time Standing (BarChart3) - attendance rate, FDA
4. Academic Privacy Lock (ShieldCheck) - admins cannot mutate
5. Configurable FDA Rules (Clock) - per-class thresholds
6. Smart Roster Sync (Users) - join requests, cross-module

**Roles Section:**
Three role cards:
1. For Instructors - own roll-call/gradebook, rapid launch
2. For Students - track standing, join classes, file excuses
3. For Administrators - provision faculty, read-only academic

**Final CTA Section:**
- Dark card (bg-zinc-900)
- "Ready to start your academic term?"
- Sign In / Student Registration buttons

**Footer:**
- "AcademiaTrack • Digital Class Record & Attendance System • University Academic Suite"

**Auth-context functions called:**
- `useAuth()` - gets `goToScreen`
- `goToScreen("login")` - navigate to login
- `goToScreen("register")` - navigate to registration

---

### 2. TEST SUITE ANALYSIS

All tests are located in `c:\Users\joshu\Documents\GitHub\attendance-system\tests\` and use Node.js built-in test runner (`node:test`).

---

#### **2.1 Test Files Overview**

| File | What it Tests | Source Modules Imported |
|------|---------------|------------------------|
| `auth-engine.test.ts` | Email normalization, validation, password validation, student number format, OTP generation/validation, email masking | `src/lib/auth/auth-engine.ts` |
| `gradebook-engine.test.ts` | Category score calculation, weighted grades, blank-vs-zero handling, student standing, score input validation, eligibility detection, attendance auto-generation | `src/lib/grades/gradebook-engine.ts`, `src/types/index.ts` |
| `schedule-calendar.test.ts` | Time parsing, class duration, day filtering, schedule conflict detection | `src/lib/schedule/timetable-engine.ts`, `src/types/index.ts` |
| `stagger-transition.test.ts` | Stagger animation constants, delay calculations, duration math, reduced motion handling, notch sidebar sync | `src/lib/transitions/stagger-transition.ts` |
| `curved-tab-sidebar.test.ts` | Curved tab easing, duration, corner radius, gradient formulas, transform calculations, ARIA attributes, reduced motion, role-based navigation | `src/lib/sidebar/sidebar-engine.ts` |
| `admin-portal.test.ts` | Instructor account provisioning, user filtering, suspension toggling, policy validation, academic mutation permissions | `src/lib/admin/admin-portal-engine.ts`, `src/types/index.ts` |
| `student-portal.test.ts` | Student summary computation, excuse submission validation, timetable merging | `src/lib/student/student-portal-engine.ts`, `src/types/index.ts` |
| `cross-module-sync.test.ts` | Cross-module discrepancy detection, Scenario B auto-sync, Scenario A skip logic, Excel export generation | `src/lib/sync/cross-module-sync.ts`, `src/lib/export/excel-export.ts` |
| `session-and-excuse-engine.test.ts` | Schedule date generation, FDA exemptions, effective absence calculation, excuse approval/decline workflows | `src/lib/attendance/session-engine.ts`, `src/types/index.ts` |
| `roll-call-engine.test.ts` | Session creation, status recording, hotkey handling, navigation, summary calculation, finalization | `src/lib/attendance/roll-call-engine.ts`, `src/types/index.ts` |
| `smart-matching.test.ts` | Join request matching (exact ID, name), approval/decline workflows | `src/lib/roster/smart-matching-engine.ts`, `src/types/index.ts` |
| `roster-engine.test.ts` | Name parsing, clipboard TSV parsing, alphabetical sorting, row validation | `src/lib/roster/roster-engine.ts`, `src/types/index.ts` |
| `types-and-roles.test.ts` | Academic data isolation permissions, POV toggle for dual roles, attendance metrics, class code generation | `src/lib/auth/permissions.ts`, `src/lib/attendance/attendance-engine.ts` |

---

#### **2.2 Demo/Mock Data and Personas in Tests**

**Tests with mock/demo data:**

1. **`auth-engine.test.ts`**
   - Uses test emails like `"arthur.pendelton@university.edu"`, `"Elena.Vance@University.EDU"`
   - Tests normalization and validation

2. **`admin-portal.test.ts`**
   - `mockUsers` array with 3 personas: Admin (Maria Santos), Instructor+Admin (Joshua Aquino), Student (Sofia Aquino)
   - Tests provisioning, filtering, suspension, academic mutation permissions

3. **`student-portal.test.ts`**
   - `mockGradeItems`, `mockStudentGrades`, `mockAttendance` for Sofia Aquino
   - Tests summary computation, excuse validation, timetable merging

4. **`cross-module-sync.test.ts`**
   - `mockStudents` array: Maria Aquino, Juan Cruz, Ana Dela Cruz
   - Tests discrepancy detection, Scenario A/B sync, Excel export

5. **`roll-call-engine.test.ts`**
   - `mockStudents`: Marcus Chen, Sofia Aquino, Gabriel Zubiri
   - Tests session creation, hotkey handling, status recording

6. **`smart-matching.test.ts`**
   - `sampleRoster`: Sofia Aquino, Marcus Chen, Gabriel Zubiri
   - Tests join request matching by ID/name, approval/decline workflows

7. **`roster-engine.test.ts`**
   - Sample TSV clipboard data with student info
   - Tests parsing, sorting, validation

**Summary:** Most tests use mock personas based on the Aquino, Chen, Zubiri student names and Pendelton, Vance instructor names. The `DEMO_USERS` in auth-context.tsx match these test personas.

---

### 3. GLOBALS.CSS DESIGN TOKENS

**File:** `c:\Users\joshu\Documents\GitHub\attendance-system\src\app\globals.css`

**Color Tokens (CSS Variables):**

```css
/* Alabaster & Academic Garnet Color Tokens */
--canvas-bg: #FAFAFA;           /* Main page background */
--surface-card: #FFFFFF;        /* Card/surface backgrounds */
--primary-garnet: #7C1D26;      /* Primary brand color */
--garnet-hover: #5E141B;        /* Hover state for garnet */
--garnet-tint: #FDF2F3;         /* Light tint for backgrounds */
--ink-primary: #09090B;         /* Primary text */
--ink-secondary: #71717A;       /* Secondary/muted text */
--border-subtle: #E4E4E7;       /* Subtle borders */

/* Semantic Attendance Pills */
/* Present (P) - Green */
--pill-p-text: #047857;
--pill-p-bg: #ECFDF5;
--pill-p-border: #A7F3D0;

/* Late (L) - Amber */
--pill-l-text: #B45309;
--pill-l-bg: #FFFBEB;
--pill-l-border: #FDE68A;

/* Excused (E) - Blue */
--pill-e-text: #1D4ED8;
--pill-e-bg: #EFF6FF;
--pill-e-border: #BFDBFE;

/* Absent (A) - Rose */
--pill-a-text: #BE123C;
--pill-a-bg: #FFF1F2;
--pill-a-border: #FECDD3;
```

**Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

**Glassmorphism Utility Classes:**
```css
.glass-nav {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(228, 228, 231, 0.8);
}

.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 4px 20px -2px rgba(124, 29, 38, 0.03), 
              0 2px 6px -1px rgba(0, 0, 0, 0.04);
}

.glass-spotlight-active {
  background: #FFFFFF;
  border: 1px solid rgba(124, 29, 38, 0.35);
  box-shadow: 0 12px 32px -4px rgba(124, 29, 38, 0.12), 
              0 4px 12px -2px rgba(0, 0, 0, 0.05);
}
```

**Semantic Attendance Pill Classes:**
```css
.pill-status-p   /* Present - green */
.pill-status-l   /* Late - amber */
.pill-status-e   /* Excused - blue */
.pill-status-a   /* Absent - rose */
```

Each pill class sets:
- `color` (text color)
- `background-color`
- `border: 1px solid`

---

### 4. EMPTY STATE COMPONENT PATTERN

**Finding:** No dedicated "empty state" component exists in `src/components/`.

**Search performed:**
- Glob for `*empty*` files: No results
- Grep for `EmptyState`, `empty-state`, `empty.state`: No matches

**Current approach:** The codebase appears to handle empty states inline within components using conditional rendering. No standardized empty state pattern or utility classes specifically for empty states were found in globals.css.

**Recommended location for new empty state component:** `src/components/empty-state.tsx` (does not currently exist)

---

## SUMMARY

### Auth UI Flow Architecture

1. **Entry Point:** `AuthPortal` switches between 4 screens based on `authScreen` state
2. **Landing:** Marketing page with CTAs to login/register
3. **Login:** Email + password with demo account quick-fill
4. **Register:** 9-field student registration form with student number format validation
5. **Forgot Password:** 3-step OTP flow (email -> verify code -> new password)

### Key Error Strings (for Supabase Auth integration):

**Registration errors:**
- `"Student number must follow the YYYY-NNNNN format (e.g. 2024-10492)."`
- `"Passwords do not match."`
- `"Unable to create your account."`

**Login errors:**
- `"Please enter a valid email address."`
- `"No account found for that email address."`
- `"This account has been suspended. Contact the registrar."`
- `"Incorrect password. Please try again."`

**OTP errors:**
- `"Please request a new verification code."`
- `"Incorrect verification code. Please try again."`

### Design Tokens for Auth UI:

- **Primary:** `#7C1D26` (Academic Garnet)
- **Primary Hover:** `#5E141B`
- **Background:** `#FAFAFA` (Canvas/Alabaster)
- **Surface:** `#FFFFFF`
- **Text Primary:** `#09090B`
- **Text Secondary:** `#71717A`
- **Error:** `#BE123C` (Rose) with `#FFF1F2` bg

### Test Suite Notes:

- **16 test files** covering core business logic
- **Node.js native test runner** (no Jest/Vitest)
- All tests use **mock personas**: Sofia Aquino, Marcus Chen, Gabriel Zubiri (students); Arthur Pendelton, Elena Vance (instructors); Maria Santos (admin)
- **No UI/component tests** currently - all tests are unit tests for business logic engines
- Mock data aligns with `DEMO_USERS` in `auth-context.tsx`

Now let me continue reading the remaining lib files and components to complete the comprehensive analysis:

Now I have all the information needed. Let me compile the comprehensive architecture documentation:

---

# Complete Data/State Architecture Documentation

## Summary for Supabase Migration

This document provides a complete analysis of the attendance system's data architecture, identifying all mock data sources, state management patterns, and engine functions to enable full Supabase PostgreSQL migration.

---

## 1. LAYOUT & CONFIGURATION FILES

### `src/app/layout.tsx`
**Providers wrapped:**
- `AuthProvider` from `@/features/auth/auth-context` - Global authentication context

### `next.config.ts`
- Standard Next.js 15 configuration with Turbopack
- No custom data source configuration

### `tsconfig.json`
- Path alias: `@/*` maps to `./src/*`

### `vercel.json`
- Framework set to "nextjs"

### Middleware
**No `middleware.ts` file exists** - No edge middleware for auth/data

### API Routes
**No `route.ts` files found under `src/app`** - No API routes currently exist

### Supabase Client Usage
**Current Status: NOT IMPORTED ANYWHERE**
- `src/lib/supabase/client.ts` - Browser client (unused)
- `src/lib/supabase/server.ts` - Server client (unused)

---

## 2. LIBRARY ENGINE FILES (`src/lib/`)

### 2.1 Admin Engine (`src/lib/admin/admin-portal-engine.ts`)

**Type:** Pure Logic (Stateless)

**Exported Functions:**
| Function | Signature | Pure/Impure |
|----------|-----------|-------------|
| `generateTemporaryPassword` | `(): string` | Pure |
| `provisionInstructorAccount` | `(params, existingUsers) => ProvisionInstructorResult` | Pure |
| `filterUsers` | `(users, searchQuery, roleFilter) => UserProfile[]` | Pure |
| `toggleUserSuspension` | `(user) => UserProfile` | Pure |
| `validateSystemPolicyConfig` | `(config) => PolicyValidationResult` | Pure |
| `assertAcademicMutationPermitted` | `(actor, assignedInstructorId) => void` | Pure (throws) |

**Mock Data Dependencies:** None (accepts data as parameters)

---

### 2.2 Attendance Engine (`src/lib/attendance/attendance-engine.ts`)

**Type:** Pure Logic (Stateless)

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `calculateAttendanceMetrics` | `(records, maxAbsenceThreshold) => AttendanceMetrics` |
| `generateClassCode` | `(): string` |

**Mock Data Dependencies:** None

---

### 2.3 Roll-Call Engine (`src/lib/attendance/roll-call-engine.ts`)

**Type:** Pure Logic (Stateless)

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `createRollCallSession` | `(students, classId, date?) => RollCallSessionState` |
| `recordStudentStatus` | `(state, index, status, note?) => RollCallSessionState` |
| `handleRollCallHotkey` | `(state, key) => RollCallSessionState` |
| `advanceRollCallIndex` | `(state, direction) => RollCallSessionState` |
| `jumpToRollCallIndex` | `(state, targetIndex) => RollCallSessionState` |
| `updateStudentNote` | `(state, index, note) => RollCallSessionState` |
| `computeRollCallSummary` | `(state) => RollCallSummary` |
| `finalizeRollCallSession` | `(state) => AttendanceRecord[]` |

**Mock Data Dependencies:** None

---

### 2.4 Session Engine (`src/lib/attendance/session-engine.ts`)

**Type:** Pure Logic (Stateless)

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `generateScheduleDates` | `(schedule, startDate, endDate) => string[]` |
| `isSessionExemptFromFDA` | `(type) => boolean` |
| `calculateEffectiveAbsencesWithSessions` | `(records, maxThreshold) => SessionAttendanceCalculation` |
| `resolveExcuseSlipApproval` | `(request, existingRecords) => { updatedRecord, updatedRequest }` |
| `resolveExcuseSlipDecline` | `(request, rejectionReason) => ExcuseRequest` |

**Mock Data Dependencies:** None

---

### 2.5 Auth Engine (`src/lib/auth/auth-engine.ts`)

**Type:** Pure Logic (Stateless)

**Exported Constants:**
| Constant | Value |
|----------|-------|
| `DEMO_PASSWORD` | `"Academia2026!"` |
| `OTP_LENGTH` | `6` |

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `normalizeEmail` | `(email) => string` |
| `validateEmail` | `(email) => boolean` |
| `validatePassword` | `(password) => { valid, message? }` |
| `validateStudentNumber` | `(studentNumber) => boolean` |
| `generateOtp` | `(length?) => string` |
| `validateOtp` | `(input, expected) => boolean` |
| `maskEmail` | `(email) => string` |

**Mock Data Dependencies:** None

---

### 2.6 Permissions (`src/lib/auth/permissions.ts`)

**Type:** Pure Logic (Stateless)

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `canUserModifyAcademicRecords` | `(role) => boolean` |
| `getAvailableViews` | `(roles) => Role[]` |
| `switchActiveView` | `(roles, targetRole) => Role` |
| `canAccessRoute` | `(roles, pathname) => boolean` |

**Mock Data Dependencies:** None

---

### 2.7 Excel Export (`src/lib/export/excel-export.ts`)

**Type:** Pure Logic (Stateless) - Client-side only

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `generateMultiSheetExcelXml` | `(data) => string` |
| `downloadExcelWorkbook` | `(data, filename?) => void` |

**Mock Data Dependencies:** None (receives all data via parameters)

---

### 2.8 Gradebook Engine (`src/lib/grades/gradebook-engine.ts`)

**Type:** Pure Logic (Stateless)

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `calculateCategoryScore` | `(items, grades, studentId, category) => CategoryScoreResult` |
| `convertPercentageToMark` | `(pct) => string` |
| `calculateStudentStanding` | `(items, grades, studentId, weights?) => StudentStandingResult` |
| `validateScoreInput` | `(input, maxScore) => ScoreValidationResult` |
| `determineEligibleStudentsForGrading` | `(students, todayAttendance?) => EligibleStudentGradingItem[]` |
| `autoGenerateAttendanceFromGrades` | `(classId, date, students, gradesForActivity) => AttendanceRecord[]` |

**Mock Data Dependencies:** None

---

### 2.9 Roster Engine (`src/lib/roster/roster-engine.ts`)

**Type:** Pure Logic (Stateless)

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `parseStudentName` | `(fullName) => { lastName, firstName, middleInitial? }` |
| `parseClipboardRosterData` | `(clipboardText, classId) => RosterStudent[]` |
| `sortRosterAlphabetically` | `(students) => SequencedStudent[]` |
| `validateStudentRow` | `(student) => { valid, error? }` |

**Mock Data Dependencies:** None

---

### 2.10 Smart Matching Engine (`src/lib/roster/smart-matching-engine.ts`)

**Type:** Pure Logic (Stateless)

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `normalizeStudentId` | `(id) => string` |
| `matchJoinRequestToRoster` | `(request, roster) => MatchResult` |
| `approveJoinRequest` | `(request, roster, targetStudentId?) => { updatedRequest, updatedRoster }` |
| `declineJoinRequest` | `(request, roster, reason?) => { updatedRequest, updatedRoster }` |

**Mock Data Dependencies:** None

---

### 2.11 Mock Roster (`src/lib/roster/mock-roster.ts`)

**Type:** DATA SEED FILE (HOLDS MOCK DATA)

**Exported Mock Data:**
| Constant | Type | Description |
|----------|------|-------------|
| `DEFAULT_ROSTER` | `RosterStudent[]` | 5 mock students with photos |
| `DEFAULT_JOIN_REQUESTS` | `JoinRequest[]` | 3 pending join requests |
| `DEFAULT_EXCUSE_REQUESTS` | `ExcuseRequest[]` | 2 pending excuse slips |
| `DEFAULT_GRADE_ITEMS` | `GradeItem[]` | 4 grade items (quiz, PT, exam) |
| `DEFAULT_STUDENT_GRADES` | `StudentGrade[]` | 20 grade records |
| `INITIAL_ATTENDANCE_RECORDS` | `AttendanceRecord[]` | 10 attendance records |
| `INITIAL_SESSION_DATES` | `string[]` | 3 session dates |
| `INITIAL_SESSION_TYPES` | `Record<string, SessionType>` | Session type mappings |

**MIGRATION PRIORITY:** This file contains ALL the seed/mock data currently used by components. All of these must be replaced with Supabase queries.

---

### 2.12 Timetable Engine (`src/lib/schedule/timetable-engine.ts`)

**Type:** Pure Logic (Stateless)

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `parseTimeToMinutes` | `(timeStr) => number` |
| `computeClassDurationMinutes` | `(startTime, endTime) => number` |
| `filterClassesForDay` | `(classes, day) => ScheduledClassItem[]` |
| `detectScheduleConflict` | `(existingBlocks, candidate) => ScheduleBlock \| null` |
| `formatTime12Hour` | `(time24) => string` |

**Exported Constants:**
| Constant | Value |
|----------|-------|
| `WEEKDAYS` | `DayOfWeek[]` |

**Mock Data Dependencies:** None

---

### 2.13 Sidebar Engine (`src/lib/sidebar/sidebar-engine.ts`)

**Type:** Pure Logic (Stateless)

**Exported Constants:**
| Constant | Value |
|----------|-------|
| `CURVED_TAB_DURATION_MS` | `587` |
| `CURVED_TAB_EASING` | CSS easing string |
| `CURVED_TAB_CORNER_RADIUS_PX` | `14` |
| `CURVED_TAB_TRANSITION` | CSS transition string |

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `CURVED_TAB_TOP_GRADIENT` | `(panelColor?) => string` |
| `CURVED_TAB_BOTTOM_GRADIENT` | `(panelColor?) => string` |
| `computeTabTransform` | `(index, itemHeight?) => string` |
| `getSidebarAriaAttributes` | `(isActive) => object` |
| `resolveSidebarMotionTransition` | `(prefersReducedMotion) => string` |
| `getRoleNavigationItems` | `(role) => RoleNavigationItem[]` |
| `findActiveTabIndex` | `(items, activeId?, fallbackIndex?) => number` |

**Mock Data Dependencies:** None

---

### 2.14 Student Portal Engine (`src/lib/student/student-portal-engine.ts`)

**Type:** Pure Logic (Stateless)

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `computeStudentPersonalSummary` | `(params) => StudentPersonalSummary` |
| `validateExcuseSubmission` | `(params) => ValidateExcuseResult` |
| `mergeStudentTimetable` | `(enrolledClasses, externalSubjects) => MergedTimetableItem[]` |

**Exported Types:**
| Type | Description |
|------|-------------|
| `StudentPersonalSummary` | Combined attendance + grades summary |
| `ValidateExcuseResult` | Excuse validation result |
| `ExternalSubject` | Manual external subject type |
| `MergedTimetableItem` | Unified timetable entry |

**Mock Data Dependencies:** None

---

### 2.15 Cross-Module Sync (`src/lib/sync/cross-module-sync.ts`)

**Type:** Pure Logic (Stateless)

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `detectCrossModuleDiscrepancies` | `(params) => CrossModuleDiscrepancy[]` |
| `executeScenarioASkip` | `(params) => ScenarioASkipResult` |
| `executeScenarioBSync` | `(params) => ScenarioBSyncResult` |

**Exported Constants:**
| Constant | Value |
|----------|-------|
| `SCENARIO_B_EXPLICIT_NOTICE` | `string` |

**Mock Data Dependencies:** None

---

### 2.16 Stagger Transitions (`src/lib/transitions/stagger-transition.ts`)

**Type:** Pure Logic (Stateless)

**Exported Constants:**
| Constant | Value |
|----------|-------|
| `NOTCH_SIDEBAR_DURATION_MS` | `587` |
| `NOTCH_STAGGER_LEAVE_MS` | `190` |
| `NOTCH_STAGGER_ARRIVE_MS` | `340` |
| `STAGGER_PER_BLOCK_DELAY_MS` | `70` |
| `STAGGER_MAX_DELAY_MS` | `350` |
| Various easing constants | CSS strings |

**Exported Functions:**
| Function | Signature |
|----------|-----------|
| `calculateBlockDelay` | `(index, perBlockDelayMs?, maxDelayMs?) => number` |
| `calculateLeaveDuration` | `(blockCount, syncWithNotch?, ...) => number` |
| `calculateArriveDuration` | `(blockCount, syncWithNotch?, ...) => number` |
| `resolveStaggerTransitionConfig` | `(prefersReducedMotion, blockCount?, syncWithNotch?) => StaggerTransitionConfig` |

---

## 3. COMPONENTS STATE ANALYSIS (`src/components/`)

### Component State Ownership Summary

| Component | State Types | Engine Functions | Seeds From Mock |
|-----------|-------------|------------------|-----------------|
| `admin-hub.tsx` | `useState` (users, classes, config, modals) | `filterUsers`, `toggleUserSuspension` | YES - `INITIAL_ADMIN_USERS`, `INITIAL_ADMIN_CLASSES` |
| `auth-login-screen.tsx` | `useState` (form fields, error) | `validateEmail`, `normalizeEmail`, `validateOtp` | YES - `DEMO_USERS` from context |
| `auth-portal.tsx` | `useState` (screen state) | None | No |
| `auth-register-screen.tsx` | `useState` (form fields) | `validateEmail`, `validatePassword`, `validateStudentNumber` | No |
| `auth-otp-reset-screen.tsx` | `useState` (otp, steps) | `generateOtp`, `validateOtp`, `maskEmail` | No |
| `class-attendance-sheet.tsx` | `useState` (records, session dates, types, modals) | `generateScheduleDates`, `calculateEffectiveAbsencesWithSessions`, `isSessionExemptFromFDA`, `detectCrossModuleDiscrepancies` | YES - `INITIAL_ATTENDANCE_RECORDS`, `DEFAULT_ROSTER`, `DEFAULT_EXCUSE_REQUESTS` |
| `class-grades-matrix.tsx` | `useState` (grade items, student grades, editing cell, modals) | `calculateCategoryScore`, `calculateStudentStanding`, `validateScoreInput`, `detectCrossModuleDiscrepancies` | YES - `DEFAULT_GRADE_ITEMS`, `DEFAULT_STUDENT_GRADES`, `DEFAULT_ROSTER` |
| `class-roster-table.tsx` | `useState` (students, requests, search, paste preview) | `sortRosterAlphabetically`, `parseClipboardRosterData`, `parseStudentName`, `validateStudentRow` | YES - `DEFAULT_ROSTER`, `DEFAULT_JOIN_REQUESTS` |
| `class-workspace.tsx` | `useState` (unified cross-module state) | `downloadExcelWorkbook`, `detectCrossModuleDiscrepancies` | YES - All mock data from `mock-roster.ts` |
| `create-class-modal.tsx` | `useState` (form fields) | `generateClassCode` | No |
| `create-grade-item-modal.tsx` | `useState` (form fields) | None | No |
| `excuse-slip-resolution-modal.tsx` | `useState` (selected request, rejection reason) | `resolveExcuseSlipApproval`, `resolveExcuseSlipDecline` | No |
| `instructor-hub.tsx` | `useState` (classes, search, create modal) | None | YES - `INITIAL_INSTRUCTOR_CLASSES` |
| `join-request-queue.tsx` | `useState` (local requests/roster copy) | `matchJoinRequestToRoster`, `approveJoinRequest`, `declineJoinRequest` | No (receives from parent) |
| `landing-page.tsx` | `useState` (active feature index) | None | No |
| `navbar.tsx` | None | None | No |
| `portal-shell.tsx` | `useState` (complex navigation state, classes, workspace) | All hub/workspace engines | YES - All mock data |
| `rapid-grading-overlay.tsx` | `useState` (grades, current index, flags) | `calculateCategoryScore`, `executeScenarioASkip`, `autoGenerateAttendanceFromGrades` | No (receives from parent) |
| `rapid-roll-call-overlay.tsx` | `useState` (session state, flags) | `createRollCallSession`, `handleRollCallHotkey`, `advanceRollCallIndex`, `computeRollCallSummary`, `finalizeRollCallSession` | No (receives from parent) |
| `sidebar.tsx` | `useState` (active index, mobile drawer, menu) | `getSidebarAriaAttributes`, `findActiveTabIndex`, `getRoleNavigationItems` | YES - `DEMO_USERS` from context |
| `staggered-view.tsx` | None (uses CSS custom properties) | `calculateLeaveDuration`, `calculateArriveDuration`, `resolveStaggerTransitionConfig` | No |
| `student-hub.tsx` | `useState` (extensive: classes, records, grades, requests, modals) | `computeStudentPersonalSummary`, `mergeStudentTimetable`, `validateExcuseSubmission` | YES - All mock data |
| `student-class-detail-modal.tsx` | `useState` (tab, filters) | None | No (receives from parent) |
| `student-external-class-modal.tsx` | `useState` (form fields) | None | No |
| `student-join-class-modal.tsx` | `useState` (form fields, step) | None | No |

---

## 4. KEY STATE MANAGEMENT PATTERNS

### 4.1 Auth Context (`src/features/auth/auth-context.tsx`)

**State Held:**
- `activePersonaKey`: Currently selected demo user
- `registeredAccounts`: Array of registered accounts
- `passwordOverrides`: Password overrides for demo users
- `registeredUser`: Currently registered user
- `activeView`: Current role view
- `isAuthenticated`: Boolean auth state
- `authScreen`: Current auth screen
- `otpStore`: Stored OTPs for password reset

**Mock Data Sources:**
- `DEMO_USERS` - Hardcoded demo personas

**Persistence:**
- `localStorage.setItem("active_persona_key")` - Persists selected persona

---

### 4.2 Unified Cross-Module State (in `class-workspace.tsx`)

**State Held (shared across tabs):**
- `students`: `RosterStudent[]`
- `attendanceRecords`: `AttendanceRecord[]`
- `sessionDates`: `string[]`
- `sessionTypes`: `Record<string, SessionType>`
- `gradeItems`: `GradeItem[]`
- `studentGrades`: `StudentGrade[]`

**Mock Data Sources:**
- All from `mock-roster.ts`

---

## 5. MOCK DATA INVENTORY (`src/lib/roster/mock-roster.ts`)

### Complete List of Export Constants:

| Export | Data Type | Record Count |
|--------|-----------|--------------|
| `DEFAULT_ROSTER` | `RosterStudent[]` | 5 students |
| `DEFAULT_JOIN_REQUESTS` | `JoinRequest[]` | 3 requests |
| `DEFAULT_EXCUSE_REQUESTS` | `ExcuseRequest[]` | 2 requests |
| `DEFAULT_GRADE_ITEMS` | `GradeItem[]` | 4 items |
| `DEFAULT_STUDENT_GRADES` | `StudentGrade[]` | 20 grades |
| `INITIAL_ATTENDANCE_RECORDS` | `AttendanceRecord[]` | 10 records |
| `INITIAL_SESSION_DATES` | `string[]` | 3 dates |
| `INITIAL_SESSION_TYPES` | `Record<string, SessionType>` | 3 entries |

---

## 6. MIGRATION PRIORITY MATRIX

### Phase 1: Core Data (High Priority)
1. **Auth System**
   - Replace `DEMO_USERS` with Supabase Auth
   - Replace `registeredAccounts` with database table
   - Replace `otpStore` with proper OTP service

2. **Roster Data**
   - Replace `DEFAULT_ROSTER` with `students` table
   - Replace `DEFAULT_JOIN_REQUESTS` with `join_requests` table

### Phase 2: Academic Records (Medium Priority)
3. **Attendance**
   - Replace `INITIAL_ATTENDANCE_RECORDS` with `attendance_records` table
   - Replace `DEFAULT_EXCUSE_REQUESTS` with `excuse_requests` table

4. **Grades**
   - Replace `DEFAULT_GRADE_ITEMS` with `grade_items` table
   - Replace `DEFAULT_STUDENT_GRADES` with `student_grades` table

5. **Sessions**
   - Replace `INITIAL_SESSION_DATES`/`TYPES` with `class_sessions` table

### Phase 3: Advanced Features (Lower Priority)
6. **Cross-Module Sync**
   - `detectCrossModuleDiscrepancies` - Add database constraints
   - `executeScenarioASkip`, `executeScenarioBSync` - Add triggers/functions

---

## 7. DATABASE SCHEMA RECOMMENDATIONS

Based on the engine analysis, the following Supabase tables are recommended:

```sql
-- Core Tables
users (extends auth.users)
students
instructors
admins

-- Class Structure
classes
class_schedules
class_sessions

-- Roster Management
roster_students
join_requests

-- Attendance
attendance_records
excuse_requests

-- Grades
grade_items
student_grades

-- System
system_policies
departments
```

---

This documentation provides the complete foundation for migrating from mock/local state to Supabase PostgreSQL. All engine functions are pure and stateless, making them compatible with server-side data fetching patterns.

I now have a full picture. Let me check the project documentation and Next.js version notes before writing code.

Next 16 uses `proxy.ts` (middleware renamed). Let me verify the Supabase APIs from real source and measure component sizes.

Let me establish a baseline before changing anything.

Baseline is green (68 tests pass, lint warnings only). Let me read the remaining files I need for accurate data-layer contracts.

I have enough context. Let me set up the task list and start building the foundation.

Now the schema migration.

Now the data-access layer. Starting with profiles and classes.

Now the Supabase-backed auth context.

I'll continue with TODO #5. Let me read the current state of the auth files.

Now I'll update the three auth screens. Starting with the login screen.

Now the OTP reset screen.

Let me check remaining DEMO_USERS usage and page.tsx.

Auth screens done. Now the sidebar persona switcher and shell gating. Let me read sidebar.tsx.

Now I'll finish the admin hub's tabs with loading/error/empty states.

Now the classes tab.

I'll tighten student read access on attendance/grades (RLS) before wiring the student hub.

I'll delegate the student-hub refactor in parallel while I handle the class workspace.

I'll start by reading the authoritative requirement and the files I need to refactor, plus the infrastructure I must use.

Now let me read the authoritative requirement and the infrastructure files.

Let me read the remaining infrastructure files.

Now let me read the mount-guard pattern, portal-shell, auth-context, and types.

Let me read the instructor-hub pattern and the types.

Let me look at how loading/error states and initials avatars are done elsewhere for style consistency.

Let me check the initials-avatar pattern used in roster table for consistency.

Let me check the RLS policies to understand what a student can see, and look at how join requests are consumed elsewhere.

I have all the context. Let me verify the mock-roster import is truly gone and check for any other references to the constants I'm removing.

The other 4 files reference the deleted `mock-roster` (pre-existing, out of scope). Now I'll write the refactored `student-hub.tsx`.

I'll continue from where I left off. Let me read the three modals that still need refactoring, plus confirm the current state of the rewritten hub.

Now let me read the current state of the rewritten hub to confirm the modal contracts, and the relevant data-layer files.

Now let me read the data-layer files and types to confirm exact signatures.

Let me check the RLS policies for classes and the join flow, plus the empty-state component and types.

Let me read the RLS helper functions to understand whether a student can resolve a join code before enrolling.

Let me read UPDATE2.md as the task requires, and check the JoinRequest/Notification types.

I now have the full picture. The RLS `classes_select` policy only exposes classes a user is a member of — I'll note that. Let me refactor the three modals. Starting with the join modal:

Now the external subject modal — remove prefilled sample defaults and validate required fields:

Now the class detail modal — add proper empty states and confirm no mock data:

Now let me run the verification commands:

No errors in my four files — only pre-existing issues elsewhere. Now lint:

Lint flags a `set-state-in-effect` error in my `student-hub.tsx` (line 155). Let me fix it:

My four files now produce zero lint issues. Let me re-confirm tsc is still clean for my files:

Let me do a final sanity check for any residual mock/Unsplash references in my four files:

All verification is complete. Here is the report.

## Files changed (only the four in scope)

1. **`src/components/student-hub.tsx`** — fully rewritten
   - Removed the `@/lib/roster/mock-roster` import and every mock constant (`enrolledClasses`, `stud_01`/`BSCS`/`3rd Year`, `INITIAL_ATTENDANCE_RECORDS`, `DEFAULT_GRADE_ITEMS`, `DEFAULT_STUDENT_GRADES`, `DEFAULT_EXCUSE_REQUESTS`, hardcoded `joinRequests` with an Unsplash photo, 3 hardcoded notifications, `ext_01`).
   - Enrolled classes now come only from `listVisibleClasses(supabase)`; identity (`studentNumber`, `program`, `academicLevel`) resolves from `listMyRosterEntries(supabase, currentUser.id)`, with the roster row `id` used as `studentId` for attendance/grades (via a `Map<classId, RosterStudent>`).
   - One data-load effect does a single `Promise.all` over enrolled classes for `listAttendance` / `listGradeItems` / `listStudentGrades` / `listExcuses` plus `listMyJoinRequests`.
   - Notifications: `listNotifications` + `subscribeToNotifications` (cleanup unsubscribes); live unread dot only when unread exist; dropdown empty message; `createdAt` rendered via a local relative-time helper (`Notification` has no `time` field).
   - Real dates via `new Date()` guarded by the `useSyncExternalStore` mount pattern (`emptySubscribe`/`isMounted` copied from instructor-hub); today's classes filter by real weekday; room/time derived from class `schedule` blocks using `formatTime12Hour`.
   - Loading spinner ("Loading your portal…"), rose error banner, and empty states (below). `StudentHubProps` remains exactly `{ activeTab?: StudentTab }`. All student-facing labels use `whitespace-nowrap`/`truncate`.
2. **`src/components/student-join-class-modal.tsx`** — rewritten
   - Removed the hardcoded `instructorName` and the Unsplash `photoIdUrl`.
   - Looks up the class from the real classes passed in, falling back to `findClassByJoinCode(supabase, classCode)`; calls `submitJoinRequest(supabase, {...})` with `requesterId = currentUser.id`; inline errors; submitting state; `onJoinSubmitted` prop updated to `(courseName: string)`; confirmation clearly reports a **pending** instructor approval; empty state when no classes are available to browse.
3. **`src/components/student-class-detail-modal.tsx`** — renders only from props (no mock data existed); added `EmptyState` for "No attendance records" (replaces the old table-empty row) and "No grades recorded" (when `classGradeItems.length === 0`).
4. **`src/components/student-external-class-modal.tsx`** — removed the prefilled sample defaults (`Room 201`, `13:00`/`14:30`); subjects are created only from user input; added validation for required start/end times in addition to title and `start < end`.

## Data-layer functions
None added — every function required already existed in `src/lib/data/*` (`listVisibleClasses`, `findClassByJoinCode`, `listMyRosterEntries`, `listMyJoinRequests`, `submitJoinRequest`, `listAttendance`, `listExcuses`, `submitExcuse`, `listGradeItems`, `listStudentGrades`, `listNotifications`, `markNotificationRead`, `subscribeToNotifications`).

## Empty states introduced
- Hub: "No classes joined yet" (Today + Classes tabs, with a Join a Class action), "No classes scheduled today", "Your timetable is empty" (with Add External Subject action), "No join applications yet", and "No notifications yet" in the dropdown.
- Join modal: "No classes to browse".
- Class detail modal: "No attendance records", "No grades recorded".
- External modal: subjects are added only from user input (no seeded data).

## Verification output (exact)

`npx tsc --noEmit` — my four files produce **no errors**. Remaining pre-existing errors (out of scope, other agents' files):
```
src/components/admin-hub.tsx(167,60): error TS2345: Argument of type 'boolean | undefined' is not assignable to parameter of type 'boolean'.
src/components/class-attendance-sheet.tsx(14,57): error TS2307: Cannot find module '@/lib/roster/mock-roster' or its corresponding type declarations.
src/components/class-grades-matrix.tsx(16,8): error TS2307: Cannot find module '@/lib/roster/mock-roster' or its corresponding type declarations.
src/components/class-roster-table.tsx(25,55): error TS2307: Cannot find module '@/lib/roster/mock-roster' or its corresponding type declarations.
src/components/class-workspace.tsx(21,8): error TS2307: Cannot find module '@/lib/roster/mock-roster' or its corresponding type declarations.
```

`npm run lint` — my four files produce **zero issues** (filtered run shows no matches). Project total dropped from 13 problems to **12 problems (3 errors, 9 warnings)**, all pre-existing and outside scope: `set-state-in-effect` errors in `admin-hub.tsx`, `portal-shell.tsx`, `auth-context.tsx`, plus `<img>`/`exhaustive-deps` warnings. (I fixed one `set-state-in-effect` error my rewrite had briefly introduced in `student-hub.tsx`.)

## Key finding / note for the parent
The `classes_select` RLS policy is `is_class_member(id) or instructor_id = auth.uid()`, and `is_class_member` requires an existing roster row. This means a not-yet-enrolled student cannot read a class row, so `findClassByJoinCode` will return `null` for the join-by-code flow under current RLS. The insert policy (`join_requests_insert`: `requester_id = auth.uid() or is null`) does permit the request. Wiring is correct per spec, but the join flow needs a small RLS/policy change (e.g. a SECURITY DEFINER lookup function or a select policy allowing authenticated users to read rows by join code) to actually resolve classes — that's a backend change outside the four files I

Now update `findClassByJoinCode` to use the RPC.

I'll verify the current state before continuing the workspace refactor.

---

