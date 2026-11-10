# API Reference

Base URL: `/api` (locally `http://localhost:5000/api`).

There's a ready-made Postman collection in [Tasknix.postman_collection.json](Tasknix.postman_collection.json). Import it and run **Register** first (or **Login** if the account already exists). Postman keeps the cookie for the other requests. **Login as demo** needs the demo account (`pnpm seed`).

All responses are JSON. Successful responses look like:

```json
{ "success": true, "data": { } }
```

Errors look like this (`errors` is only present for validation problems):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "Title is required" }]
}
```

## Authentication

Login and register set an `httpOnly` cookie called `token` that contains a JWT (valid for 7 days by default). Browsers send it automatically. For Postman or curl you can also send the token as `Authorization: Bearer <token>`.

Routes marked **Private** return `401` without a valid session.

| Status | When |
| ------ | ---- |
| 400 | Invalid body, query or id |
| 401 | Not logged in, expired/invalid token, wrong credentials |
| 404 | Task doesn't exist **or belongs to another user** |
| 409 | Email already registered |
| 413 | Request body over 10kb |
| 403 | Trying to change the shared demo account's profile or password |
| 429 | Rate limit hit: 10 failed login/register attempts per IP, 10 failed logins per account, 5 wrong current passwords per user (all per 15 min), or 1000 API requests per IP per 15 min |
| 500 | Unexpected server error (details are only logged on the server) |

---

## Auth

### `POST /api/auth/register`

Public. Creates an account and logs the user in.

```json
{ "name": "Ranjith Kumar", "email": "ranjith@example.com", "password": "password123" }
```

- `name`: 2 to 50 characters
- `email`: valid email, stored lowercase, must be unique
- `password`: at least 8 characters and at most 72 bytes (bcrypt's limit, so fewer characters if it has accents or emoji), with at least one letter A-Z and one digit

Response `201`:

```json
{
  "success": true,
  "message": "Account created",
  "data": {
    "id": "6aed5f7aae6282ad450b43a9",
    "name": "Ranjith Kumar",
    "email": "ranjith@example.com",
    "role": "user",
    "createdAt": "2026-11-06T05:02:51.006Z",
    "updatedAt": "2026-11-06T05:02:51.006Z"
  }
}
```

Unknown fields (for example `role`) are rejected with `400`.

### `POST /api/auth/login`

Public. Same response shape as register (`200`). Wrong email and wrong password both return `401 Invalid email or password`.

```json
{ "email": "ranjith@example.com", "password": "password123" }
```

### `POST /api/auth/logout`

Clears the auth cookie. `200`.

### `GET /api/auth/me`

Private. Returns the logged in user.

### `PATCH /api/auth/me`

Private. Update `name` and/or `email`. Returns the updated user. `409` if the new email is taken, `403` for the demo account.

```json
{ "name": "Ranjith K" }
```

### `PATCH /api/auth/password`

Private. Changes the password, issues a fresh cookie and invalidates every other session (tokens issued before the change are rejected). `403` for the demo account.

```json
{ "currentPassword": "password123", "newPassword": "newPassword456" }
```

`newPassword` follows the same rules as `password` on register and has to be different from `currentPassword`.

`400` with `errors[0].field = "currentPassword"` if the current password is wrong.

---

## Tasks

All task routes are **Private**. A user can only ever see or change their own tasks.

Task object:

```json
{
  "id": "6aed5f7bae6282ad450b43aa",
  "title": "Write tests",
  "description": "",
  "status": "Pending",
  "priority": "High",
  "dueDate": "2026-11-20T00:00:00.000Z",
  "completedAt": null,
  "user": "6aed5f7aae6282ad450b43a9",
  "createdAt": "2026-11-06T05:02:51.686Z",
  "updatedAt": "2026-11-06T05:02:51.686Z"
}
```

- `status`: `Pending` | `In Progress` | `Completed`
- `priority`: `Low` | `Medium` | `High`
- `dueDate`: a calendar day. Send it as `YYYY-MM-DD`; it's stored as midnight UTC.
- `completedAt`: set automatically when the status becomes `Completed`, cleared when it changes back.

### `GET /api/tasks`

List tasks with search, filters, sorting and pagination.

| Query param | Description | Default |
| ----------- | ----------- | ------- |
| `page` | Page number (1+) | `1` |
| `limit` | Page size (1 to 100) | `10` |
| `search` | Case-insensitive match on title or description | |
| `status` | `Pending`, `In Progress` or `Completed` | |
| `priority` | `Low`, `Medium` or `High` | |
| `overdue` | `true` = not completed and due before `today` | |
| `dueFrom`, `dueTo` | Due date range, inclusive (`YYYY-MM-DD`) | |
| `sort` | `createdAt`, `updatedAt`, `dueDate`, `priority` or `title`. Prefix with `-` for descending | `-createdAt` |
| `today` | The client's local date (`YYYY-MM-DD`), used for `overdue` | server's UTC date |

Example: `GET /api/tasks?status=Pending&sort=-priority&page=2&limit=5`

```json
{
  "success": true,
  "data": [ { "id": "...", "title": "..." } ],
  "pagination": { "page": 2, "limit": 5, "total": 12, "totalPages": 3 }
}
```

### `GET /api/tasks/stats`

Counts for the dashboard. Optional `today` query param as above.

```json
{
  "success": true,
  "data": {
    "total": 4,
    "byStatus": { "Pending": 2, "In Progress": 1, "Completed": 1 },
    "byPriority": { "Low": 1, "Medium": 2, "High": 1 },
    "overdue": 1,
    "dueToday": 1,
    "completionRate": 25
  }
}
```

### `GET /api/tasks/:id`

Returns one task. `400` for a malformed id, `404` if it doesn't exist or isn't yours.

### `POST /api/tasks`

Response `201` with the created task.

```json
{
  "title": "Write tests",
  "description": "Cover the auth routes",
  "status": "Pending",
  "priority": "High",
  "dueDate": "2026-11-20"
}
```

`title` (max 100) and `dueDate` are required. `description` max 1000. Unknown fields such as `user` are rejected.

### `PATCH /api/tasks/:id`

Partial update: send only the fields you want to change (at least one). Same validation as create.

```json
{ "status": "Completed" }
```

### `DELETE /api/tasks/:id`

```json
{ "success": true, "message": "Task deleted", "data": { "id": "6aed5f7bae6282ad450b43aa" } }
```

---

## Activity

### `GET /api/activity?limit=10`

Private. The user's latest task events, newest first (`limit` 1 to 50). Entries are kept for 90 days.

```json
{
  "success": true,
  "data": [
    {
      "id": "6aed5f7c...",
      "task": "6aed5f7b...",
      "taskTitle": "Write tests",
      "action": "status_changed",
      "meta": { "from": "Pending", "to": "In Progress" },
      "createdAt": "2026-11-06T05:10:00.000Z"
    }
  ]
}
```

`action` is one of `created`, `updated`, `status_changed`, `completed`, `deleted`.

---

## Health

### `GET /api/health`

`200 { "success": true, "database": "connected" }`, or `503` if MongoDB is unreachable. Used by Render's health check.
