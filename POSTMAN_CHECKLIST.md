# CampusHub API testing checklist

Set `baseUrl` to `http://localhost:5000`, then run `npm.cmd run prisma:seed` after applying migrations. Demo password: `CampusHub123!`.

## Authentication

- `POST {{baseUrl}}/api/auth/login` body `{"email":"arjun.ece@campushub.dev","password":"CampusHub123!"}` — expect `200` and save `data.token` as `studentToken`.
- Log in as `admin@campushub.dev` and `faculty@campushub.dev` to create `adminToken` and `facultyToken`.
- `GET /api/auth/me` with `Authorization: Bearer {{studentToken}}` — expect `200`, no password.
- `GET /api/users/me`, then `PATCH /api/users/me` body `{"name":"Arjun Mehta"}` — expect `200`.

## Student APIs

- `GET /api/courses/available`, `GET /api/courses`, and `GET /api/courses/:id` with `studentToken`.
- `POST /api/courses/:id/enroll` for an available course — expect `201`; repeat — expect `409`; `DELETE` the same URL — expect `200`.
- `GET /api/timetable`, `/api/timetable/today`, and `/api/timetable/next` — expect only ECE semester 3 entries for Arjun.
- `GET /api/assignments`, `GET /api/assignments/:id`, then `PATCH /api/assignments/:id/complete` and `/incomplete` — expect only enrolled-course assignments and per-user completion state.
- `GET /api/attendance`, `/api/attendance/:courseId`, and `/api/attendance/summary` — expect only Arjun's records and calculated percentages.
- `GET /api/dashboard` — expect user, today's classes, upcoming assignments, and aggregate attendance.

## Admin APIs

Use `adminToken` for every request below. A student/faculty token must return `403`.

- `POST /api/admin/courses` body `{"name":"Computer Networks","code":"CS401","teacher":"Dr. Sen"}`.
- `PATCH` and `DELETE /api/admin/courses/:id`.
- `POST /api/admin/course-offerings` body `{"courseId":1,"branch":"ECE","semester":3,"isRequired":true}`; then patch/delete it.
- `POST /api/admin/timetable` body `{"courseOfferingId":1,"dayOfWeek":1,"startTime":"09:00","endTime":"10:00","room":"A-101","type":"Lecture"}`; then patch/delete it.
- `POST /api/admin/assignments` body `{"courseId":1,"title":"Quiz 1","description":"Chapter 1","duedate":"2026-11-01T23:59:00.000Z"}`; then patch/delete it.
- `POST /api/admin/attendance` body `{"userId":3,"courseId":1,"present":true,"date":"2026-09-15"}`.
- `POST /api/admin/enrollments` body `{"userId":3,"courseId":1}`, then `DELETE /api/admin/enrollments/:id`.
- `POST /api/admin/faculty-courses` body `{"facultyId":2,"courseId":1}`, then delete it by its returned ID.

## Faculty authorization

Use `facultyToken`; first ensure the faculty user is assigned to the course through `/api/admin/faculty-courses`.

- `POST /api/admin/faculty/assignments` body `{"courseId":1,"title":"Lab 1","duedate":"2026-11-03T23:59:00.000Z"}`.
- `PATCH` / `DELETE /api/admin/faculty/assignments/:id` for that course.
- `POST /api/admin/faculty/attendance` body `{"userId":3,"courseId":1,"present":true}`.
- Repeat any faculty request with a course that has not been assigned — expect `403`.
