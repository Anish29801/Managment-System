# Server — Project Overview

## General Description
The server is a **Node.js + Express 5 + TypeScript** REST API backend for the Task Management System. It provides JWT-based authentication, full CRUD for users and tasks, subtask management via embedded documents, search/filter capabilities, and MongoDB persistence via Mongoose.

---

## Tech Stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| Runtime        | Node.js (via `ts-node` for dev)                  |
| Framework      | Express 5.1.0                                    |
| Language       | TypeScript 5.9.2                                  |
| Database       | MongoDB via Mongoose 8.18.1                       |
| Auth           | `jsonwebtoken` (JWT) + `bcryptjs` (password hash) |
| Validation     | `zod` 4.1.9 (available but not used in server)   |
| Dev Tools      | `nodemon` (hot reload), `ts-node` (TS execution)  |
| Environment    | `dotenv`                                          |

---

## Project Structure

```
server/
├── src/
│   ├── middleware/
│   │   ├── auth.ts               # JWT verification middleware
│   │   └── taskAuth.ts           # Duplicate auth middleware (unused?)
│   ├── model/
│   │   ├── config/
│   │   │   └── conn.ts           # MongoDB connection
│   │   ├── Task.ts               # Task + embedded Subtask schema
│   │   └── User.ts               # User schema
│   ├── routes/
│   │   ├── index.ts              # Route aggregator
│   │   ├── taskRoutes.ts         # Task + Subtask CRUD routes
│   │   └── userRoutes.ts         # User CRUD + auth routes
│   ├── app.ts                    # Express app setup + DB connect
│   ├── server.ts                 # Entry point (CORS, listen)
│   ├── types.ts                  # TypeScript interfaces (IUser, ITask, etc.)
│   └── env.d.ts                  # ProcessEnv type declarations
├── nodemon.json                  # Nodemon config
├── tsconfig.json                 # TypeScript config (CommonJS)
├── package.json
└── .gitignore
```

---

## Key Architecture Decisions

1. **Express 5** — uses the latest Express 5 release (alpha/beta) with updated router behavior.
2. **CommonJS modules** — TypeScript compiles to CommonJS (not ESM).
3. **Embedded Subtasks** — Subtask is not a separate collection; it's an embedded subdocument array within the Task model. This simplifies queries but limits independent subtask querying.
4. **JWT stored in `req.userId`** — The `verifyToken` middleware decodes the token and attaches `userId` to the request object via global Express type augmentation.
5. **Two auth middleware files** — `auth.ts` (used) and `taskAuth.ts` (unused duplicate). `auth.ts` is the active one.
6. **CORS locked to `http://localhost:3000`** — Only the Next.js dev server is allowed.
7. **`zod` is a dependency but unused in server code** — Present in `package.json` but not imported in any route/middleware file.
8. **No error handling middleware** — All routes use try/catch with inline `res.status(500)` responses. No centralized error handler.

---

## Environment Variables (`env.d.ts`)

| Variable     | Type   | Required | Description          |
|--------------|--------|----------|----------------------|
| `PORT`       | string | No       | Server port (default 8000) |
| `MONGO_URI`  | string | Yes      | MongoDB connection string |
| `JWT_SECRET` | string | Yes      | JWT signing secret    |

---

## Package Scripts

| Script  | Command                      |
|---------|------------------------------|
| `dev`   | `nodemon`                    |
| `build` | `tsc`                        |
| `start` | `node dist/server.js`        |
