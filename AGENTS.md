<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# attendance-system

Digital Class Record & Attendance Management System — a multi-role university web application
(Admin / Instructor / Student) that digitizes class records, daily attendance via rapid roll-call,
categorized grades with cross-module sync, and real-time academic standing. Built with the
BrewedOps Agentic Framework (https://brewedops.cloud/framework).

## Stack
Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + Supabase (auth, database, storage, realtime).
- Supabase provides Row-Level Security for strict academic data isolation (admins blocked from
  grade/attendance mutations).
- Framer Motion for spring-physics transitions and the Rapid Roll-Call overlay animation.
- Inter / Plus Jakarta Sans (UI), JetBrains Mono (Student IDs, codes, scores).

## Structure
- Feature folders `src/features/<domain>/`; API and data logic in `lib/`, never in components.
- Components render, hooks orchestrate, lib does the work.
- Files `kebab-case`, components `PascalCase`, functions `camelCase`.
- Routes in `app/`, server-only code never imported by client components.

## Real package code (opensrc) - always, before using any dependency
- Run `opensrc path <package>` and read the real source before writing code that uses it.
  npm `opensrc path <name>` | Python `pypi:<name>` | Rust `crates:<name>` | GitHub `<user>/<repo>`
- Cite the file you read. Never guess method names, options or types, even for familiar packages.

## The build loop - for every small piece
0. **Check first**: write a test (for UI, a browser check) that FAILS because the change is
   missing; build until it passes. Test, lint and build must all be green before "done".
   Test command: `npm test` (uses Node.js built-in test runner: `node --test tests/**/*.test.ts`)
   Tests: 67 passing unit tests across auth, gradebook, timetable, session, roster, matching, sync, and admin engines
1. **code-structure skill**: one version of each operational step; repeats go into a service
   layer. Actions own the rules, services own the mechanics.
2. **Clarity pass** on the changed code only: same behavior, fewer lines, no nested ternaries,
   no clever one-liners, no refactoring of untouched code.
3. **scanloop skill**: gitleaks + semgrep + osv-scanner on the diff. Every secret is blocking.
4. **greploop skill**: review panel scores 1-5; fix blocking + major findings, re-review from a
   fresh context until no blocking or major finding is left. Keep diffs small - a big diff
   never converges.
5. Commit, push, CI green. That is "done". It is not "live".

## CI and deploy (ship skill)
- Target: Vercel | Live: https://academiatrack.joshuaturtoga.dev/ | Server path / process: Vercel Next.js edge/serverless
- Deploy command: Vercel Git integration on `main` | Rollback: Vercel instant rollback
- CI (`.github/workflows/ci.yml`) runs a clean install, lint, test and build on Linux for every
  push to `main` and every PR.
- After ANY dependency change: `gh workflow run relock.yml`, `git pull`, `gh workflow run ci.yml`.
- **Nothing deploys unless the user says "deploy" for this change.** A push to an
  auto-deploying branch counts as a deploy.
- Before every deploy: `node scripts/preflight-deploy.mjs --live <LIVE_URL>` must pass, then
  the ship skill's checklist - rollback prepared BEFORE upload.
- Uploaded is not live. Check the live `version.json`, then use the changed feature on the real
  site. Report what was verified and what the user still needs to check.

## Notes (long-term memory)
- Notes folder: C:/Users/joshu/agent-notes (plain Markdown).
- Search it before any web search when a task touches past work or decisions.
- On "save progress": a dated note under `10 - Projects/attendance-system/` - what changed,
  what went wrong, what to remember - then commit and push.

## House rules
- Everything in the user's global rules file applies here too.
- Strict academic data isolation: admins CANNOT mutate grades or attendance. Only the verified
  instructor assigned to a class can perform academic state mutations. Enforce via Supabase RLS
  and API middleware.
- Attendance status values: P (Present), L (Late), E (Excused), A (Absent). No other values.
- Grade scores: `NULL / is_missing = true` means ungraded/missed. `score = 0.0` means the
  student took the assessment and scored zero. Never conflate the two.
- The "Tardy Ratio" formula (default 3 lates = 1 absence) and FDA warning engine must be
  configurable per class, never hardcoded.
- Color palette: Alabaster & Academic Garnet (#7C1D26 primary). Use the design tokens defined
  in DOCUMENTATION.md section 2B. Never hardcode colors outside tokens.
