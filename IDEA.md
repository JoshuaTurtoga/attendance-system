# MASTER SYSTEM PROMPT: DIGITAL CLASS RECORD & ATTENDANCE MANAGEMENT SYSTEM

## 1. ROLE & OBJECTIVE

Act as a Principal Full-Stack Software Architect and Product Engineer. Your objective is to design and build a comprehensive **Digital Class Record & Attendance Management System** (Phase 1: Responsive Web Application, architected for Phase 2 Mobile scalability).

The platform digitizes university class records, attendance tracking, and grade computation. Instructors create customizable class workspaces, pre-populate class rosters, and generate unique join codes. Students register with their official university credentials, apply to join classes, and track their real-time standing.

---

## 2. GLOBAL AUTHENTICATION, ROLES & SECURITY RULES

1. **Three Core User Roles:**
   - **System Administrator (Admin)**
   - **Faculty (Instructor)**
   - **Student**
2. **Account Provisioning & Registration:**
   - **Students:** Can self-register, but registration is strictly restricted to official university email domains. Students set their own secure password upon registration.
   - **Instructors:** Cannot self-register. Accounts and initial temporary passwords are strictly provisioned and distributed by System Administrators.
3. **Password Recovery Workflow:**
   - Users can initiate a "Forgot Password" flow that sends a time-sensitive One-Time Password (OTP) to their registered (or alternative) email address. Verifying the OTP unlocks the password reset form.
4. **Dual-Role Accounts & POV Toggle:**
   - A single user account can hold multiple roles simultaneously (e.g., `Instructor + Admin` or `Student + Admin`).
   - Users with administrative privileges have a prominent **POV Toggle Button** in the top navigation bar to switch seamlessly between their standard portal (Instructor/Student view) and the **Admin Dashboard POV**.
5. **Strict Academic Data Privacy (Admin Restriction):**
   - While Admins have systemic oversight over users and classes, **Admins are strictly blocked at both the UI and API levels from creating, editing, or manipulating grades, attendance records, or individual student academic data.** Academic record modification is exclusively locked to the assigned class instructor.

---

## 3. PORTAL SPECIFICATIONS BY ROLE

### A. SYSTEM ADMINISTRATION (ADMIN) PORTAL

- **Instructor Account Provisioning:** Form to create instructor accounts, assign departments, and generate/distribute initial credentials.
- **Central Admin Dashboard:**
  - **User Management:** View, search, filter, suspend, or manage Admin, Instructor, and Student accounts.
  - **Class Oversight:** View all created classes across the institution, assigned instructors, and enrollment counts (read-only access to academic internals).
  - **Global System Settings:** Configure active academic terms/semesters, mini-terms, university departments/programs, and default institutional attendance policies (e.g., default late-to-absent conversion ratios and maximum absence thresholds).

---

### B. FACULTY (INSTRUCTOR) PORTAL

#### 1. Account Onboarding

- Upon first login, instructors are prompted to complete their profile: **First Name, Middle Name, Last Name**, and Department.

#### 2. "Today" Dashboard (Daily Quick-Access Hub)

- Displays all classes scheduled for the current day in chronological order.
- Each class card features one-click quick-action buttons:
  - **"Record Attendance Today"** (launches the rapid roll-call overlay for today's session).
  - **"Record Grades Today"** (launches the smart activity creation + rapid grading workflow).

#### 3. Instructor Class Schedule

- An automatically generated visual weekly timetable mapping out all classes, rooms, and time blocks currently handled by the instructor.

#### 4. Class Creation & Configuration

- Instructors can create a new class workspace with the following parameters:
  - **Course Code & Title:** (e.g., `STAS - Science, Technology and Society`)
  - **Section & Class Type:** (e.g., `E106-R`, `Lecture` or `Laboratory`)
  - **Academic Metadata:** Units, Term/Semester, and Mini-Term.
  - **Schedule & Room Configuration:**
    - Standard Mode: Select days of the week (Checklist), Time range, and Room (defaults to `"TBA"`).
    - **Dynamic Scheduling Toggle:** A checkbox for _"Different Rooms and Schedules"_ allowing instructors to bind different time blocks and rooms to specific days of the week (e.g., Mon/Wed in Room 201 at 9:00 AM, Fri in Lab 3 at 1:00 PM).
- **Class Join Code:** Auto-generates a unique alphanumeric **Class Code** that instructors can copy, share, and **Refresh/Regenerate** at any time (invalidating the previous code).

#### 5. Isolated Class Workspace (4 Main Tabs)

Each class acts as an independent workspace with four tabs:

##### TAB 1: CLASS LIST & SMART ENROLLMENT

- **Pre-Populated Roster Table:** A 5-column master table:
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
  - **Smart Matching Engine:** Automatically compares the applicant's `Student ID Number` and name against the instructor's pre-populated 5-column class list. If a match is found, the system highlights the matched row in green and links the student's live account to that pre-existing roster slot upon clicking **Approve**.
  - Instructors can **Approve** or **Decline** (with an optional reason) each request.

##### TAB 2: ATTENDANCE SYSTEM

- **Session & Calendar Engine:**
  - Automatically generates valid school date columns based on the class's configured weekly schedule and semester dates.
  - Allows instructors to add **Make-up Class** dates or mark specific dates as **Holiday**, **Suspended (Weather/Institutional)**, or **Instructor Self-Absence** (a dedicated toggle for instructors to officially mark themselves absent so the session does not penalize students).
- **Four Core Attendance Statuses:**
  - `Present (P)`
  - `Late (L)`
  - `Excused (E)`
  - `Absent (A)`
- **Dual Recording Workflows:**
  1. **Master Grid View:** A spreadsheet-style matrix (`Rows: Students`, `Columns: Valid Class Dates`). Instructors can click any cell to select `P`, `L`, `E`, or `A` via dropdown and attach optional text **Notes** (e.g., reason for absence/tardiness).
  2. **"Record Attendance Today" Rapid Overlay:** A focused, card-based modal that cycles through the roster student-by-student:
     - Displays Student Name, Student Number, and **ID Photo** (for visual face-to-name verification).
     - **Single-Key Shortcuts:** Press `P` (Present), `L` (Late), `E` (Excused), or `A` (Absent) to mark and auto-advance.
     - Quick input field for session notes.
     - Navigation controls: `Confirm / Next`, `Go Back`, and `Jump to Student` dropdown.
- **Attendance Policy & Warning Engine:**
  - **Tardiness Conversion:** Configurable rule (default: `3 Late = 1 Equivalent Absent`).
  - **FDA (Failure Due to Absences) / Cut Limit Tracking:** Tracks total unexcused absences against maximum allowed cuts (e.g., 20% of total class hours). Flags students in the grid with status badges: `Safe (Green)`, `Warning - Near Limit (Yellow)`, and `FDA Risk / Exceeded (Red)`.
- **Excuse Slip Resolution Queue:**
  - Reviews student-submitted excuse requests (with attached medical certificates/letters). Approving a request automatically switches the cell status to `Excused (E)` and links the document to the cell's note metadata.

##### TAB 3: GRADES MANAGEMENT

- **Categorized Master Grid View:**
  - Rows represent students; columns are grouped under three primary categories: **Quizzes**, **Exams**, and **Performance Tasks**.
- **Add a Record (Activity Creation):**
  - Form inputs: **Activity Type** (`Quiz`, `Exam`, `Performance Task`), **Activity Name** (e.g., _Prelim Exam_, _Quiz 1_), **Description** (optional), **Max Score**, and **Date** (with one-click _"Today"_ auto-fill).
- **Strict Blank vs. Zero (`0`) Handling:**
  - A score of `0` means the student took the assessment and scored zero.
  - An ungraded or missed assessment is stored as `NULL / Missing` (displayed as blank or `--`), preventing premature grade deflation until finalized by the instructor.
- **Dual Grading Workflows:**
  1. **Manual Grid Editing:** Direct inline spreadsheet editing with keyboard navigation.
  2. **Streamlined "Record Grades" Overlay:** Identical UX to the rapid attendance overlay—cycles student-by-student to input earned scores or mark as `"Missing"`.
- **"Record Grades Today" (Smart Cross-Module Workflow):**
  - Triggered from the "Today" Dashboard or Grades tab. Opens the "Add a Record" modal (auto-dated to today) and immediately launches the student-by-student grading overlay.
  - **Scenario A (Attendance Already Exists for Today):** The grading overlay **automatically skips** students who were marked `Absent` today, saving the instructor time.
  - **Scenario B (No Attendance Recorded Yet for Today):** The overlay loops through the entire roster. Upon completion, a confirmation prompt asks: _"Would you like to auto-generate today's attendance based on this activity?"_
    - Students with a recorded numerical score $\rightarrow$ Marked `Present (P)`.
    - Students marked as missing $\rightarrow$ Marked `Absent (A)`.
    - **Explicit System Warning:** Displays a clear notice reminding the instructor that auto-generation only assigns `Present` or `Absent`, and any `Late` or `Excused` statuses must be adjusted manually.
- **Automated Grade Computation & Excel Export:**
  - Dynamically computes category subtotals, weighted standings, and final grades based on the configured grading formula.
  - One-click **Export to Excel (`.xlsx`)** generating an institutional-format workbook containing the Class Roster, Attendance Matrix, Categorized Grade Sheet, and Computed Final Grades.

##### TAB 4: BETA — NOTES & TO-DO

- A lightweight scratchpad and task checklist scoped to the specific class for the instructor to track lesson progress, reminders, and upcoming announcements.

---

### C. STUDENT PORTAL

#### 1. Mandatory Account Onboarding

- Upon first login with their university email, students must complete their profile before accessing class features:
  - **Full Name** (First, Middle, Last)
  - **Student ID Number** (used for Smart Matching)
  - **Department, Program/Course, and Year Level**
  - **Mobile Number & Alternative Email**
  - **Official ID Photo Upload** (displayed to instructors during join approval and rapid roll-call).

#### 2. "Today" Dashboard

- Displays the student's scheduled classes for the current day.
- Dynamically updates in real time to show today's recorded **Attendance Status** (`P`, `L`, `E`, `A`) and any **Grades/Scores** recorded for those classes today.

#### 3. Student Navigation & Core Features

- **Joined Classes (Personal Academic Records):**
  - Students can open any enrolled class to view their **own** attendance history, attendance percentage/cut warnings, and their **own** scores across Quizzes, Exams, and Performance Tasks (strictly isolated—cannot view classmates' records).
  - Ability to submit an **Excuse Request** for an absence by selecting the date, inputting a reason, and uploading supporting documentation.
- **Join Class Workflow:**
  - Students input the **Course Code** and the unique **Class Code** (plus schedule verification).
  - Upon submission, displays the confirmation prompt: _"Successfully sent a request to join the class [Course Name] to Instructor [Instructor Name]."_
- **Class Requests Tracker:**
  - Lists all pending join applications and displays declined requests along with the instructor's remarks.
- **Visual Class Schedule:**
  - Automatically generates a weekly college timetable from all approved classes.
  - Includes a **"Manually Add External Class"** feature so students can plot subjects whose instructors are not yet using the platform, giving them a complete personal schedule.
- **Real-Time Notifications:**
  - In-app notification bell that alerts the student immediately when:
    - A join request is Approved or Declined.
    - A new grade/score is recorded by an instructor.
    - An attendance record is marked `Absent` or approaches the maximum cut warning threshold.
- **Profile Management ("Change Details"):**
  - Update contact info, password, or ID photo (Student ID Number changes require verification/locking once matched to active classes).

---
