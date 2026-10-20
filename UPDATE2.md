# AcademiaTrack — Grade Sheet & System Revision Notes

## Backend (Supabase) & Deployment Preparation
9. **Purge All Mockup, Test & Placeholder Data (Production Clean Slate):**
   - Completely remove all hardcoded mockup data, dummy student rosters, placeholder scores/grades, simulated attendance logs, fake notifications, and test accounts/users (`test-users`) across the codebase.
   - Replace static demo arrays with clean, well-designed **Empty States** (e.g., *"No classes created yet"*, *"No students in roster"*, *"No grades recorded"*) so the system is 100% ready for real institutional onboarding and live production use.
10. **Supabase Full-Stack Integration & Production Deployment:**
    - Replace all mock/local state with Supabase PostgreSQL queries, Supabase Auth, Row-Level Security (strictly blocking Admins from mutating grades/attendance), Supabase Storage (student ID photos and excuse slip uploads), and Supabase Realtime (live grade/attendance notifications).
    - **Strict Domain Verification:** Student registration must be strictly limited to the official university email domain (`@universityofbohol.edu.ph`). Personal emails (e.g., Gmail, Yahoo) must be explicitly blocked with a clear UI error message during sign-up.
    - Prepare environment variables, TypeScript build checks, and routing configuration for production deployment on https://academiatrack.joshuaturtoga.dev/.

---

## Post-Implementation Next Steps
*(Note: Use these steps once the AI provides the generated code and Supabase environment variables)*

1. **Verify Empty States & Responsiveness:** 
   Run the development server locally (`npm run dev`). Verify that the UI renders clean empty states without mockup data, and that layouts do not wrap or break when resizing the browser to mobile width.
2. **Execute Database Migrations:** 
   Open the Supabase SQL Editor for your project and run the provided SQL migration file (`001_initial_schema.sql`) to generate the tables, enums, and RLS policies.
3. **Connect Environment Variables:** 
   Create a `.env.local` file at the root of your project and paste the provided `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` values.
4. **Test the Auth & Domain Flow:** 
   Attempt to register a student using a personal Gmail account to ensure the `@universityofbohol.edu.ph` block works. Then, create a valid test student and test instructor account.
5. **Test Real-Time Sync & Workflows:** 
   Using the test instructor account, verify that the "Record Grades Today" workflow functions properly and that notifications push in real-time to the student account.
6. **Run Build Checks & Deploy:** 
   Execute `npm run build` to ensure there are no TypeScript or ESLint errors, then trigger the production deployment to Vercel (or your hosting provider) mapped to `academiatrack.joshuaturtoga.dev`.