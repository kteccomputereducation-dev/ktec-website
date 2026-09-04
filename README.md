# K TEC Computer Education — Website

A full-stack website for **K TEC Computer Education, Neyveli** — a computer training institute
offering programming, accounting, CAD/engineering software, design and professional IT courses.

This is a real, working full-stack application: a Next.js frontend talking to an Express + SQL
backend with authentication, an admin panel, a student portal, and public certificate
verification. It is not a static mockup — every button, form and API call in it is wired up and
functional against the included backend.

```
ktec-website/
├── backend/     Express API + database (SQLite in dev, Postgres-ready for production)
└── frontend/    Next.js 14 (App Router) + TypeScript + Tailwind CSS
```

---

## 1. What's implemented

**Public site:** Home, About, Courses (catalogue + detail pages), Admissions/enquiry form,
Gallery, Offers, Contact, public Certificate Verification, floating WhatsApp button (shown once
a number is configured in Settings).

**Student portal:** register/login, profile, enrolled courses & progress, attendance history,
study materials, certificates, announcements.

**Admin panel:** dashboard with stats + charts, course management (create/edit/publish/delete),
student management, enquiry management (status pipeline + notes + convert-to-admission), batch
management, certificate issuance/revocation, offers, gallery upload, testimonials, and
site-wide settings (institute name, contact info, social links, WhatsApp number, SEO fields) that
automatically reflect across the whole site.

**Cross-cutting:** JWT auth with role-based access (admin / staff / student), bcrypt password
hashing, input validation, rate limiting, centralized error handling that never leaks internals,
file-upload validation, SEO metadata + sitemap + robots.txt, responsive layout, and a
duplicate-submission guard on the enquiry form.

## 2. What's intentionally left for you to configure

Per the "don't fake it" requirement, a few things are stubbed rather than faked, because they
need real credentials or business information that wasn't provided:

- **WhatsApp number, phone, email, social links, Google Maps embed** — set these in
  **Admin → Settings** after first login. The WhatsApp button stays hidden until a number is set.
- **Email/WhatsApp notifications on new enquiries** — enquiries are saved to the database and
  create an in-app notification (`/api/dashboard/notifications`) immediately. Actually sending an
  email or WhatsApp message requires SMTP or WhatsApp Business API credentials — see
  `backend/.env.example` for where to add them; a `nodemailer`/WhatsApp API call can be added in
  `backend/routes/enquiries.js` once you have those credentials.
- **Real domain / SSL / hosting** — see the deployment section below.
- **Course fees, brochures, real testimonials, gallery photos** — sample/placeholder data only;
  everything is editable from the Admin Panel.

## 3. Quick start (local development)

Requires Node.js 18+.

### Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit JWT_SECRET (see below) and other values
npm run seed                # creates tables, a default admin user, and sample courses
npm run dev                 # starts on http://localhost:4000
```

Generate a strong `JWT_SECRET`:

```bash
openssl rand -hex 32
```

The seed script prints a default admin login (also configurable via `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` in `.env`):

```
email: admin@ktec.local
password: ChangeMe@123
```

**Change this password immediately** (there's no "change password" UI yet for the seeded account —
either update it directly via the API/DB, or create a fresh admin with
`POST /api/auth/create-user` and remove the seeded one).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL should point at your backend
npm run dev                  # starts on http://localhost:3000
```

Visit `http://localhost:3000`. Admin panel is at `/admin/login`, student login at `/login`.

## 4. Architecture notes

### Backend
- **Express** with a clean `routes/` (HTTP layer) structure; each route file owns its own
  validation (`express-validator`) and talks directly to the DB via prepared statements.
- **Database:** `better-sqlite3` for zero-setup local development
  (`backend/db/init.js` creates all tables on boot). `backend/db/schema.postgres.sql` is the
  reference schema for production Postgres — table names, columns and relationships match the
  SQLite schema closely, so moving to Postgres/MySQL means swapping the driver (or introducing
  Prisma/Knex) and running that file, not rewriting the app.
- **Auth:** JWT stored in an httpOnly cookie (also returned in the response body for non-browser
  clients), `bcryptjs` for password hashing, role middleware (`admin` / `staff` / `student`).
- **Security:** `helmet`, per-route and global rate limiting, upload type/size validation,
  centralized error handler that returns "Something went wrong" instead of stack traces in
  production, parameterized SQL everywhere (no string-built queries).

### Frontend
- **Next.js 14 App Router + TypeScript + Tailwind.** Public pages are server components that
  fetch from the API at request time; the student dashboard and admin panel are client components
  behind a lightweight `AuthProvider` (checks `/api/auth/me` on load and redirects if the role
  doesn't match).
- **Design system:** a "technical drafting / blueprint" visual language — deep navy + cyan +
  gold palette, a corner-registration-mark motif borrowed from CAD viewports, and a monospace
  type used for durations/fees/stats — intentionally tied to the institute's CAD/engineering
  course offering rather than a generic ed-tech template look. See
  `frontend/tailwind.config.ts` and `frontend/app/globals.css` for the tokens.
- **Fonts:** this build environment has no outbound access to `fonts.googleapis.com`, so
  `app/layout.tsx` currently ships curated system-font stacks instead of `next/font/google`. On a
  normal deploy target (Vercel etc., which does have internet access) you can swap in real
  Space Grotesk / Inter / IBM Plex Mono via `next/font/google` — see the comment in
  `frontend/app/layout.tsx` for the exact swap.

## 5. Production deployment

### Frontend → Vercel (or Netlify)
1. Push `frontend/` to a Git repo, import into Vercel.
2. Set env var `NEXT_PUBLIC_API_URL` to your deployed backend URL.
3. Deploy. (Optional: switch to `next/font/google` first, per the note above.)

### Backend → Render / Railway / AWS / any Node host
1. Push `backend/` to a Git repo, deploy as a Node service (`npm install && npm start`).
2. Set env vars from `.env.example`: `JWT_SECRET`, `CLIENT_ORIGIN` (your deployed frontend URL),
   `NODE_ENV=production`, `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
3. **Database:** SQLite works for a low-traffic single-instance deployment but doesn't scale
   across multiple instances or survive some hosts' ephemeral filesystems. For real production
   use, provision a managed PostgreSQL instance, run `backend/db/schema.postgres.sql` against it,
   set `DATABASE_URL`, and swap `backend/db/init.js` for a Postgres client (e.g. `pg` or
   Prisma/Knex) — the route files themselves won't need to change beyond parameter placeholder
   syntax (`?` → `$1, $2, …` for raw `pg`).
4. Run `npm run seed` once against the production database to create the first admin account,
   then change that password.
5. Point `uploads/` at persistent storage (a mounted volume, or migrate to S3/Cloudinary) if your
   host's filesystem is ephemeral.

### Domain & SSL
Point your domain (e.g. `www.kteccomputereducation.com` — only use this if it's actually
registered) at Vercel for the frontend; most Node hosts (Render, Railway, etc.) provision HTTPS
automatically for the backend. Update `NEXT_PUBLIC_API_URL` and `CLIENT_ORIGIN` accordingly, and
update the hard-coded domain in `frontend/app/sitemap.ts` / `frontend/app/robots.ts` /
`frontend/app/layout.tsx` metadata.

## 6. API documentation

See [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) for the full endpoint reference.

## 7. Default roles

| Role    | Created via                                              | Access |
|---------|-----------------------------------------------------------|--------|
| admin   | seed script, or `POST /api/auth/create-user` by an admin  | Full admin panel |
| staff   | `POST /api/auth/create-user` by an admin                  | Enquiries, students, batches, materials, certificates — no Settings/course delete |
| student | public `POST /api/auth/register`, or added by admin/staff | Student dashboard only |

## 8. Known limitations / next steps

- No "forgot password" flow yet.
- No automated tests (recommend adding `supertest` for the API and Playwright for e2e before a
  real production launch).
- Course brochure upload endpoint isn't wired yet (the download button appears once
  `courses.brochure_url` is set directly, or you can extend `routes/courses.js` with an
  upload endpoint mirroring `routes/materials.js`).
- Email/WhatsApp enquiry notifications need SMTP/WhatsApp Business API credentials (see §2).
