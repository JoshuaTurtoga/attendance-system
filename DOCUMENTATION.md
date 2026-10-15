# MASTER SYSTEM PROMPT: DIGITAL CLASS RECORD & ATTENDANCE MANAGEMENT SYSTEM

## 1. ROLE & OBJECTIVE

Act as a Principal Full-Stack Software Architect, UI/UX Designer, and Product Engineer. Your objective is to design and build a comprehensive **Digital Class Record & Attendance Management System** (Phase 1: Responsive Web Application, architected for Phase 2 Mobile scalability).

The platform digitizes university class records, attendance tracking, and grade computation. Instructors create customizable class workspaces, pre-populate class rosters, and generate unique join codes. Students register with their official university credentials, apply to join classes, and track their real-time standing.

---

## 2. UI/UX DESIGN SYSTEM, COLOR PALETTE, GLASSMORPHISM & MOTION LANGUAGE

### A. Visual Philosophy: "Minimalist Academic Glass"

- **Clean & Airy Layout:** High-contrast, distraction-free white/alabaster surfaces with generous whitespace, crisp `1px` structural borders, and refined typography (`Inter` or `Plus Jakarta Sans` for UI; `JetBrains Mono` for Student IDs, Class Codes, and numerical scores).
- **Subtle Glassmorphism:** Use translucent frosted glass layers (`backdrop-filter: blur(12px)` to `blur(16px)`, `bg-white/75`, with subtle `1px solid rgba(255, 255, 255, 0.6)` inner highlights and soft diffused shadows) for:
  - Sticky top navigation bars and POV role-toggle headers.
  - Floating action bars and quick-filter toolbars.
  - Interactive timetable/calendar subject blocks.
  - The blurred backdrop overlay during the **Inline Row-Focus ("Spotlight")** attendance and grading workflows.

### B. Color Tokens ("Alabaster & Academic Garnet")

- **Backgrounds:**
  - App Canvas: `#FAFAFA` (`bg-zinc-50`)
  - Elevated Cards / Active Table Rows: `#FFFFFF` (`bg-white`)
  - Frosted Glass Surface: `rgba(255, 255, 255, 0.75)` with `backdrop-blur-md`
- **Primary Brand Accent (Maroon / Academic Garnet):**
  - Primary Maroon: `#7C1D26` (Buttons, active tabs, focus rings, key highlights)
  - Deep Hover Maroon: `#5E141B`
  - Soft Maroon Tint: `#FDF2F3` or `rgba(124, 29, 38, 0.06)` (Subtle row hover states, active calendar blocks, soft badges)
- **Typography & Borders:**
  - Primary Ink: `#09090B` (`text-zinc-950`)
  - Secondary Muted Text: `#71717A` (`text-zinc-500`)
  - Borders & Grid Hairlines: `#E4E4E7` (`border-zinc-200/80`)
- **Semantic Attendance & Grade Status Pills:**
  - **Present (`P`):** Text `#047857`, Background `#ECFDF5`, Border `#A7F3D0` (Emerald)
  - **Late (`L`):** Text `#B45309`, Background `#FFFBEB`, Border `#FDE68A` (Amber)
  - **Excused (`E`):** Text `#1D4ED8`, Background `#EFF6FF`, Border `#BFDBFE` (Blue)
  - **Absent (`A`):** Text `#BE123C`, Background `#FFF1F2`, Border `#FECDD3` (Rose)

### C. Smooth Transitions & Micro-Animations

- **Spring Physics (Framer Motion / CSS Cubic-Bezier):** Use smooth, natural spring physics (`stiffness: 300, damping: 28` or `cubic-bezier(0.22, 1, 0.36, 1)`) across all view transitions, tab switches, and row expansions.
- **Tab & Page Transitions:** Smooth cross-fade with a subtle vertical slide (`y: 6px -> 0px`, `duration: 200ms`) when switching between _Class List, Attendance, Grades,_ and _Notes_.
- **Interactive Hover States:** Calendar blocks and dashboard cards gently lift (`-translate-y-0.5`) with a soft maroon-tinted shadow glow on hover.

---

## 3. GLOBAL AUTHENTICATION, ROLES & SECURITY RULES

1. **Three Core User Roles:**
   - **System Administrator (Admin)**
   - **Faculty (Instructor)**
   - **Student**
2. **Account Provisioning & Registration:**
   - **Students:** Can self-register, strictly restricted to official university email domains. Students set their own secure password upon registration.
   - **Instructors:** Cannot self-register. Accounts and initial temporary passwords are strictly provisioned and distributed by System Administrators.
3. **Password Recovery Workflow:**
   - Users can initiate a "Forgot Password" flow that sends a time-sensitive One-Time Password (OTP) to their registered (or alternative) email address. Verifying the OTP unlocks the password reset form.
4. **Dual-Role Accounts & POV Toggle:**
   - A single user account can hold multiple roles simultaneously (e.g., `Instructor + Admin` or `Student + Admin`).
   - Users with administrative privileges have a prominent frosted-glass **POV Toggle Pill** in the top navigation bar that smoothly animates between their standard portal (Instructor/Student view) and the **Admin Dashboard POV**.
5. **Strict Academic Data Privacy (Admin Restriction):**
   - While Admins have systemic oversight over users and classes, **Admins are strictly blocked at both the UI and API levels from creating, editing, or manipulating grades, attendance records, or individual student academic data.** Academic record modification is exclusively locked to the assigned class instructor.

---

## 4. PORTAL SPECIFICATIONS BY ROLE

### A. SYSTEM ADMINISTRATION (ADMIN) PORTAL

- **Instructor Account Provisioning:** Form to create instructor accounts, assign departments, and generate/distribute initial credentials.
- **Central Admin Dashboard:**
  - **User Management:** View, search, filter, suspend, or manage Admin, Instructor, and Student accounts.
  - **Class Oversight:** View all created classes across the institution, assigned instructors, and enrollment counts (read-only access to academic internals).
  - **Global System Settings:** Configure active academic terms/semesters, mini-terms, university departments/programs, and default institutional attendance policies (e.g., default late-to-absent conversion ratios and maximum absence thresholds).

---

### B. FACULTY (INSTRUCTOR) PORTAL

#### 1. Account Onboarding

- Upon first login, instructors complete their profile: **First Name, Middle Name, Last Name**, and Department.

#### 2. "Today" Dashboard (Daily Quick-Access Hub)

- Displays all classes scheduled for the current day in chronological order using clean white cards with subtle maroon left-border accents.
- Each class card features one-click quick-action buttons:
  - **"Record Attendance Today"** (navigates to the class's Attendance sheet and immediately triggers the Inline Row-Focus Roll-Call animation for today's date).
  - **"Record Grades Today"** (launches the smart activity creation + rapid grading workflow).

#### 3. Interactive Instructor Class Schedule (Calendar)

- An automatically generated visual weekly timetable mapping out all classes, rooms, and time blocks currently handled by the instructor.
- **Interactive Direct Redirect:** Clicking on any scheduled subject block inside the calendar smoothly transitions and redirects the instructor directly into that specific **Class Workspace**.

#### 4. Class Creation & Configuration

- Instructors can create a new class workspace with the following parameters:
  - **Course Code & Title:** (e.g., `STAS - Science, Technology and Society`)
  - **Section & Class Type:** (e.g., `E106-R`, `Lecture` or `Laboratory`)
  - **Academic Metadata:** Units, Term/Semester, and Mini-Term.
  - **Schedule & Room Configuration:**
    - Standard Mode: Select days of the week (Checklist), Time range, and Room (defaults to `"TBA"`).
    - **Dynamic Scheduling Toggle:** A checkbox for _"Different Rooms and Schedules"_ allowing instructors to bind different time blocks and rooms to specific days of the week.
- **Class Join Code:** Auto-generates a unique alphanumeric **Class Code** that instructors can copy, share, and **Refresh/Regenerate** at any time.

#### 5. Isolated Class Workspace (4 Main Tabs)

Each class acts as an independent workspace with four tabs:

##### TAB 1: CLASS LIST & SMART ENROLLMENT

- **Pre-Populated Roster Table (Alphabetical Order):** A 5-column master table sorted alphabetically by Student Last Name:
  1. `#` (Row/Sequence Number)
  2. `Student Number` (Official University ID)
  3. `Student Name` (Last Name, First Name, M.I.)
  4. `Program / Strand` (e.g., BSCS, BSN)
  5. `Academic Level` (Year Level)
- **Dual Data-Entry Methods:**
  - _Keyboard-Optimized Manual Entry:_ Type into cells, navigate with `TAB` and `ENTER`, and click `"Save All"`.
  - _Clipboard Bulk Import:_ Paste a copied 5-column table directly from Excel/Google Sheets to auto-populate rows.
- **Student Join Request Queue & Smart Matching:**
  - Displays pending applications from students who entered the Course Code + Class Code.
  - Shows the applicant's uploaded University ID photo and profile details.
  - **Smart Matching Engine:** Automatically compares the applicant's `Student ID Number` and name against the instructor's pre-populated 5-column class list. If a match is found, the system highlights the matched row and links the student's live account to that pre-existing roster slot upon clicking **Approve**.
  - Instructors can **Approve** or **Decline** (with an optional reason) each request.

##### TAB 2: ATTENDANCE SYSTEM

- **Session & Calendar Engine:**
  - Automatically generates valid school date columns based on the class's configured weekly schedule and semester dates.
  - Allows instructors to add **Make-up Class** dates or mark specific dates as **Holiday**, **Suspended (Weather/Institutional)**, or **Instructor Self-Absence** (a dedicated toggle for instructors to officially mark themselves absent so the session does not penalize students).
- **Four Core Attendance Statuses:**
  - `Present (P)`, `Late (L)`, `Excused (E)`, `Absent (A)`
- **Dual Recording Workflows:**
  1. **Master Grid View (Full List View):**
     - Displays the complete alphabetical list of students (`Rows: Students`, `Columns: Valid Class Dates`).
     - Instructors can manually click any individual cell to select `P`, `L`, `E`, or `A` via dropdown and attach optional text **Notes**.
  2. **"Record Attendance Today" — Inline Glass Row-Focus ("Spotlight") Animation Workflow:**
     - **Trigger:** Initiated from the "Today" Dashboard or by clicking _"Start Attendance Check"_ inside the Attendance Tab.
     - **Glass Blur & Row Zoom Animation:** The view remains inside the master attendance sheet. Surrounding inactive student rows and background elements smoothly transition into a frosted glass blur (`backdrop-blur-sm opacity-45`), while the **active student's row (starting from #1 in alphabetical order) smoothly scales up (`scale-[1.02]`), expands vertically, and elevates (`z-20`) as a crisp white card with a subtle maroon focus border (`border-[#7C1D26]/30`) and soft floating shadow**.
     - **Expanded Row Controls:** Inside the zoomed row, the instructor sees:
       - Student Name, Student Number, Program/Year, and their **ID Photo avatar**.
       - Interactive status pills with **Single-Key Keyboard Shortcuts**: pressing `P` (Present), `L` (Late), `E` (Excused), or `A` (Absent) marks the student with an instant pill-color pop animation.
       - An inline quick-input field for optional **Notes** (e.g., reason for tardiness/absence).
       - Quick controls: `Confirm / Next (Enter)`, `Previous Row (Up Arrow)`, `Jump to Student`, or `Exit Focus Mode (Esc)`.
     - **Sequential Row-to-Row Glide:** Upon marking a student, the current row smoothly compresses back into its standard table row size while the **next student row in alphabetical order simultaneously expands and zooms into focus**, smoothly auto-scrolling the sheet downward until the final student is marked.
- **Attendance Policy & Warning Engine:**
  - **Tardiness Conversion:** Configurable rule (default: `3 Late = 1 Equivalent Absent`).
  - **FDA (Failure Due to Absences) / Cut Limit Tracking:** Flags students in the grid with status badges: `Safe (Green)`, `Warning - Near Limit (Amber)`, and `FDA Risk / Exceeded (Crimson)`.
- **Excuse Slip Resolution Queue:**
  - Reviews student-submitted excuse requests (with attached medical certificates/letters). Approving a request automatically switches the cell status to `Excused (E)` and attaches the document link to the cell's metadata.

##### TAB 3: GRADES MANAGEMENT

- **Categorized Master Grid View:**
  - Rows represent students (in alphabetical order); columns are grouped under three primary categories: **Quizzes**, **Exams**, and **Performance Tasks**.
- **Add a Record (Activity Creation):**
  - Form inputs: **Activity Type** (`Quiz`, `Exam`, `Performance Task`), **Activity Name**, **Description** (optional), **Max Score**, and **Date** (with one-click _"Today"_ auto-fill).
- **Strict Blank vs. Zero (`0`) Handling:**
  - A score of `0` means the student took the assessment and scored zero.
  - An ungraded or missed assessment is stored as `NULL / Missing` (displayed as blank or `--`), preventing premature grade deflation.
- **Dual Grading Workflows:**
  1. **Manual Grid Editing:** Direct inline spreadsheet editing with keyboard navigation.
  2. **Streamlined "Record Grades" Inline Glass Row-Focus Workflow:** Uses the exact same frosted backdrop blur and row-zoom animation as the attendance check—expanding each student's row in alphabetical order to input their earned score (or mark as `"Missing"`) and gliding to the next student row upon pressing `Enter`.
- **"Record Grades Today" (Smart Cross-Module Workflow):**
  - Opens the "Add a Record" modal (auto-dated to today) and immediately launches the inline row-focus grading workflow.
  - **Scenario A (Attendance Already Exists for Today):** The row-focus animation **automatically skips** rows of students marked `Absent` today, gliding directly to the next present/late student.
  - **Scenario B (No Attendance Recorded Yet for Today):** Loops through all student rows alphabetically. Upon completion, a confirmation prompt asks: _"Would you like to auto-generate today's attendance based on this activity?"_
    - Students with a recorded numerical score -> Marked `Present (P)`.
    - Students marked as missing -> Marked `Absent (A)`.
    - **Explicit System Warning:** Displays a clear notice reminding the instructor that auto-generation only assigns `Present` or `Absent`, and any `Late` or `Excused` statuses must be adjusted manually.
- **Automated Grade Computation & Excel Export:**
  - Dynamically computes category subtotals, weighted standings, and final grades.
  - One-click **Export to Excel (`.xlsx`)** generating an institutional-format workbook.

##### TAB 4: BETA — NOTES & TO-DO

- A clean glassmorphic scratchpad and task checklist scoped to the specific class for the instructor to track lesson progress and reminders.

---

### C. STUDENT PORTAL

#### 1. Mandatory Account Onboarding

- Upon first login with their university email, students must complete their profile:
  - **Full Name** (First, Middle, Last)
  - **Student ID Number** (used for Smart Matching)
  - **Department, Program/Course, and Year Level**
  - **Mobile Number & Alternative Email**
  - **Official ID Photo Upload**

#### 2. "Today" Dashboard

- Displays the student's scheduled classes for the current day on clean white cards with subtle maroon accents.
- Dynamically updates in real time to show today's recorded **Attendance Status** (`P`, `L`, `E`, `A`) and any **Grades/Scores** recorded for those classes today.
- Clicking any class card redirects the student directly to that class's detailed record view.

#### 3. Student Navigation & Core Features

- **Joined Classes (Personal Academic Records):**
  - Students can open any enrolled class to view their **own** attendance history, attendance percentage/cut warnings, and their **own** scores across Quizzes, Exams, and Performance Tasks.
  - Ability to submit an **Excuse Request** for an absence by selecting the date, inputting a reason, and uploading supporting documentation.
- **Interactive Visual Class Schedule (Calendar/Timetable):**
  - Automatically generates a weekly college timetable plotting all approved/enrolled classes using frosted glass maroon-tinted subject blocks.
  - **Interactive Direct Redirect:** Clicking on any enrolled subject block in the calendar immediately redirects the student to that specific **Class View** (showing their personal attendance and grades for that subject).
  - **"Manually Add External Class" Feature:** Allows students to plot non-platform subjects for a complete personal schedule.
- **Join Class Workflow:**
  - Students input the **Course Code** and the unique **Class Code**.
  - Upon submission, displays the confirmation prompt: _"Successfully sent a request to join the class [Course Name] to Instructor [Instructor Name]."_
- **Class Requests Tracker:**
  - Lists all pending join applications and displays declined requests along with the instructor's remarks.
- **Real-Time Notifications:**
  - In-app notification bell that alerts the student immediately when a join request is resolved, a new grade is recorded, or an attendance warning is triggered.
- **Profile Management ("Change Details"):**
  - Update contact info, password, or ID photo.

---
