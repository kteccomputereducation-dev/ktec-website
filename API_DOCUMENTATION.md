# K TEC Computer Education — API Documentation

Base URL (local dev): `http://localhost:4000`

All responses are JSON with a `success: boolean` field. Authenticated requests use an httpOnly
`ktec_token` cookie set by `/api/auth/login` (send `credentials: "include"` from the browser);
API clients may instead send `Authorization: Bearer <token>` using the `token` returned by login.

Roles: `admin`, `staff`, `student`. Endpoints marked **(admin)** or **(admin, staff)** require
that role.

---

## Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/login` | — | `{ email, password }` → sets cookie, returns `{ user, token }` |
| POST | `/register` | — | Public student self-registration `{ full_name, email, phone, password }` |
| POST | `/create-user` | admin | Create staff/admin accounts `{ full_name, email, role, password, phone? }` |
| POST | `/logout` | any | Clears session cookie |
| GET | `/me` | any | Current user info |

## Courses — `/api/courses`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Published courses |
| GET | `/categories` | — | Course categories |
| GET | `/:slug` | — | Course detail + modules + FAQs |
| GET | `/admin/all` | admin, staff | All courses incl. drafts |
| POST | `/` | admin | Create course |
| PUT | `/:id` | admin | Update course fields |
| DELETE | `/:id` | admin | Soft-delete course |
| PATCH | `/:id/publish` | admin | `{ publish: boolean }` |
| POST | `/:id/image` | admin | multipart `image` file |
| POST | `/:id/modules` | admin | `{ title, description?, display_order? }` |
| POST | `/:id/faqs` | admin | `{ question, answer, display_order? }` |

## Enquiries — `/api/enquiries`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | — | Public enquiry/admission form submission |
| GET | `/?status=&search=` | admin, staff | List/filter enquiries |
| PATCH | `/:id/status` | admin, staff | `{ status }` (new/contacted/follow_up/converted/closed) |
| PATCH | `/:id/notes` | admin, staff | `{ follow_up_notes }` |
| POST | `/:id/convert` | admin, staff | `{ course_id, batch_id? }` → creates admission record |

## Admissions — `/api/admissions`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | admin, staff | List admissions |
| POST | `/` | admin, staff | `{ student_id?, course_id, batch_id? }` |
| PATCH | `/:id/status` | admin, staff | `{ status }` — confirming auto-creates enrollment |

## Certificates — `/api/certificates`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/verify` | — | `{ certificate_number }` — public verification, minimal data returned |
| GET | `/` | admin, staff | List all certificates |
| POST | `/` | admin | `{ student_id, course_id, issued_date, certificate_number? }` |
| PATCH | `/:id/revoke` | admin | Revoke a certificate |

## Students — `/api/students`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me/profile` | student | Own profile |
| PUT | `/me/profile` | student | Update phone/address/guardian info |
| GET | `/me/courses` | student | Enrolled courses + progress |
| GET | `/me/attendance` | student | Attendance history + summary |
| GET | `/me/materials` | student | Study materials for enrolled courses |
| GET | `/me/certificates` | student | Own issued certificates |
| GET | `/me/announcements` | student | Active announcements |
| GET | `/?search=&status=` | admin, staff | List/search students |
| POST | `/` | admin, staff | Create a student account |
| PUT | `/:id` | admin, staff | Update student record |
| POST | `/:id/assign-course` | admin, staff | `{ course_id, batch_id? }` |

## Batches — `/api/batches`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | admin, staff | List batches |
| POST | `/` | admin | Create batch |
| PUT | `/:id` | admin | Update batch fields |
| POST | `/:id/attendance` | admin, staff | `{ session_date, records: [{student_id, status}] }` |
| GET | `/:id/attendance` | admin, staff | Batch attendance history |

## Settings — `/api/settings`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Public site settings (key/value) |
| PUT | `/` | admin | Update settings (flat key/value object) |

## Offers — `/api/offers`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Active, in-date-range offers |
| GET | `/admin/all` | admin | All offers |
| POST | `/` | admin | Create offer |
| PUT | `/:id` | admin | Update offer |
| POST | `/:id/banner` | admin | multipart `banner` file |
| DELETE | `/:id` | admin | Delete offer |

## Gallery — `/api/gallery`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/?category=` | — | List images |
| POST | `/` | admin | multipart `image` + `category` + `caption?` |
| DELETE | `/:id` | admin | Delete image |

## Testimonials — `/api/testimonials`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Published testimonials |
| GET | `/admin/all` | admin | All testimonials |
| POST | `/` | admin | Create testimonial |
| PUT | `/:id` | admin | Update / publish-toggle |
| DELETE | `/:id` | admin | Delete |

## Study Materials — `/api/materials`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/course/:courseId` | admin, staff | Materials for a course |
| POST | `/` | admin, staff | multipart `file` + `course_id` + `title` + `batch_id?` |
| DELETE | `/:id` | admin, staff | Delete material |

## Dashboard — `/api/dashboard`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/stats` | admin, staff | Overview counts + 6-month enquiry trend + status breakdown |
| GET | `/notifications` | admin, staff | Recent in-app notifications |
| PATCH | `/notifications/:id/read` | admin, staff | Mark as read |

## Announcements — `/api/announcements`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | admin, staff | List announcements |
| POST | `/` | admin, staff | `{ title, body, audience?, is_active? }` |
| DELETE | `/:id` | admin, staff | Delete |

---

## Error format

```json
{ "success": false, "message": "Human-readable message.", "field": "optional_field_name" }
```

`4xx` errors return the actual validation/business message. `5xx` errors always return the
generic `"Something went wrong. Please try again."` — full details are logged server-side only.
