# AcademiaTrack — Grade Sheet & System Revision Notes

## UI/UX & Workflow Revisions

4. **Landing & Authentication Page:**
   - Add a public Landing Page and Login / Student Registration / OTP Password Reset flow before entering the role portals.
5. **Remove Duplicate / Redundant Redirect Buttons:**
   - Audit every page and card to remove duplicate buttons or links that redirect to the exact same destination page.
   - Keep a single intuitive click target per destination (e.g., clicking the class card opens the class workspace; remove redundant "View Class" / "Open" buttons on the same card).
6. **Remove Duplicate Export Buttons:**
   - Remove redundant or duplicate Export / "Export to Excel" buttons across the Attendance, Grades, and Class Workspace views that trigger the exact same export function.
   - Retain only one primary export button per view in the main action toolbar.
7. **Consolidate Navigation to Sidebar Only (Remove Extra Tab Buttons):**
   - Across all user roles (Admin, Instructor, and Student), remove all secondary, top-bar, or in-page tab buttons used for switching portal views.
   - Retain **only the tab buttons inside the Sidebar Navigation** as the single navigation control for all users.
8. **Responsive & Adaptive Layout (Mobile-First & Zero Text Wrapping):**
   - Make the entire attendance system responsive and adaptive across all screen sizes, especially on mobile devices.
   - Elements, tables, modals, and action bars must auto-adjust fluidly to fit the viewport.
   - Strictly prevent awkward text wrapping or line cutting on smaller screens (`whitespace-nowrap` on buttons, badges, status pills, IDs, and headers; single-line `truncate` with ellipsis on long student names or titles) and use isolated container scrolling so only data sections scroll rather than the entire page.
