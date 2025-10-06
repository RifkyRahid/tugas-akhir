# Copilot Instructions for AI Coding Agents

## Project Overview
- This is a Next.js app (TypeScript) for attendance management, bootstrapped with `create-next-app`.
- Main features: user/admin dashboards, attendance tracking, area/location management, event reminders, and leave requests.
- Data is managed via Prisma ORM (`prisma/schema.prisma`), with migrations in `prisma/migrations/`.
- UI components are in `src/components/`, organized by feature (e.g., `AbsensiTable.tsx`, `LeafletMap.tsx`, `ModalTambahEvent.tsx`).
- App routes and API endpoints are in `src/app/` (e.g., `admin/api/`, `karyawan/`, `login/`).

## Developer Workflows
- **Start dev server:** `npm run dev` (Next.js, port 3000)
- **Prisma migrations:**
  - Edit `prisma/schema.prisma`, then run migration commands (see Prisma docs)
  - Migration files are auto-generated in `prisma/migrations/`
- **Styling:** Custom CSS in `src/styles/` (e.g., `absensi.css`, `dashboard.css`).
- **Static assets:** Use `public/` for images/icons, and `uploads/` for user-uploaded files.

## Key Patterns & Conventions
- **Component structure:**
  - Use functional React components with TypeScript.
  - UI logic is separated into feature-based components (e.g., modals, tables, cards).
  - Shared UI elements are in `src/components/ui/`.
- **API/data access:**
  - Server-side logic uses Prisma via `src/lib/prisma.ts`.
  - Auth logic is in `src/lib/auth.ts` and `src/lib/server-auth.ts`.
- **Map/location features:**
  - Location and area management use Leaflet (see `LeafletMap.tsx`).
  - Attendance area logic is tied to geolocation and photo uploads.
- **Export features:**
  - Attendance data can be exported (PDF, daily reports) via dedicated components (e.g., `ExportAbsensiPDF.tsx`).

## Integration Points
- **Prisma:** All DB access via Prisma Client; schema changes require migration.
- **Next.js:** Routing, API endpoints, and SSR/ISR features are used.
- **Leaflet:** For interactive maps and geolocation features.
- **Custom CSS:** Project-specific styles override defaults; check `src/styles/` for conventions.

## Examples
- To add a new attendance area: update `prisma/schema.prisma`, run migration, then update related UI in `ModalFormArea.tsx` and map logic in `LeafletMap.tsx`.
- To add a new user field: update schema, migrate, and update `TambahKaryawanModal.tsx` and related API logic.

## References
- See `README.md` for basic setup and Next.js info.
- See `prisma/schema.prisma` for DB structure.
- See `src/components/` for UI patterns.
- See `src/lib/` for backend logic and integrations.

---

**Feedback:** If any section is unclear or missing, please specify which workflows, patterns, or integrations need more detail.