# AcademiaTrack: Digital Class Record & Attendance Management System

> Next-generation university class record, attendance tracking, rapid roll-call with face verification, automated grades sync, and transparent student standing.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev/)
[![Supabase Ready](https://img.shields.io/badge/Supabase-Ready-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)

---

## 🌟 Key Highlights & Architectural Features

- **⚡ Rapid Roll-Call Overlay (`P/L/E/A`)**: Cycle student-by-student with high-res photo verification and single-letter hotkeys (<kbd>P</kbd> Present, <kbd>L</kbd> Late, <kbd>E</kbd> Excused, <kbd>A</kbd> Absent).
- **🔄 Dual-Role POV Toggle**: Users with administrative privileges (`Instructor + Admin`) can seamlessly toggle between classroom management and institutional oversight from the top navigation bar.
- **🛡️ Strict Academic Privacy Boundary**: System Administrators manage accounts and terms, but are strictly blocked at both UI and database API levels from tampering with grades or attendance records.
- **📋 5-Column Roster & Clipboard Import**: Direct copy-paste import from Microsoft Excel or Google Sheets (`#`, `Student ID`, `Student Name`, `Program`, `Year Level`).
- **🔗 Smart Matching Engine**: Links self-registered students to their pre-populated roster row automatically via student ID numbers and photo verification.
- **📊 Cross-Module Attendance & Grades Sync**: "Record Grades Today" can auto-skip absent students or auto-populate session attendance directly from assessment submissions.
- **⚠️ Automated FDA (Failure Due to Absences) Alerts**: Tracks student cut accumulation with configurable tardy rules ($3 \text{ Late} = 1 \text{ Absent}$) and provides color-coded badges (`Safe`, `Warning`, `FDA Risk`).
- **📥 Institutional Excel Export (`.xlsx`)**: One-click download of styled, multi-sheet institutional workbooks containing the Class Roster, Attendance Matrix, Categorized Grades, and Summaries.
- **🎓 Student Academic Hub**: Students view their own real-time attendance cuts, private assessment scores, weekly timetable with external subjects, and submit absence excuse slips.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended, verified on v24)
- npm (v10+)

### Installation
```bash
# Clone the repository
git clone https://github.com/JoshuaTurtoga/attendance-system.git
cd attendance-system

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 🗄️ Database Setup (Supabase / PostgreSQL)

The application functions out-of-the-box in **Client-Side Reactive Mode** with LocalStorage persistence. To connect your live Supabase cloud backend:

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL schema and Row-Level Security policies from [`src/supabase/schema.sql`](./src/supabase/schema.sql) in the Supabase **SQL Editor**.
3. Create a `.env.local` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Restart your development server (`npm run dev`).

---

## 📁 Repository Structure

```
attendance-system/
├── .agent/
│   └── workflows/                # Agent slash commands (/new-project, /git-commit)
├── src/
│   ├── components/               # UI Portals & Modals
│   │   ├── Navbar.tsx            # Navigation, Persona switcher & POV toggle
│   │   ├── InstructorPortal.tsx  # Today hub, timetable & 4 class tabs
│   │   ├── AdminPortal.tsx       # User management, oversight & privacy lock
│   │   ├── StudentPortal.tsx     # Student standing, grades & excuse upload
│   │   ├── RapidRollCallModal.tsx# Hotkey roll-call card overlay
│   │   ├── RapidGradingModal.tsx # Cross-module grading overlay
│   │   └── SupabaseModal.tsx     # Cloud database setup guide
│   ├── services/
│   │   ├── excelExport.ts        # ExcelJS multi-sheet institutional exporter
│   │   ├── mockData.ts           # Realistic university seed dataset
│   │   └── supabase.ts           # Supabase client & connection helpers
│   ├── styles/
│   │   └── index.css             # Vanilla CSS design system & tokens
│   ├── supabase/
│   │   └── schema.sql            # PostgreSQL tables & strict RLS policies
│   ├── types/
│   │   └── index.ts              # Domain types & interfaces
│   ├── App.tsx                   # Main state coordinator
│   └── main.tsx
├── IDEA.md                       # Master product requirements draft
└── README.md
```