# Server — Entry Point & Express Configuration

## Entry Point Architecture

The server uses a **two-app pattern** (likely unintentional):

### `app.ts` — Express App Builder

```typescript
import express, { Application } from "express";
import routes from "./routes";
import dotenv from "dotenv";
import connectDB from "./model/config/conn";

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use("/", routes);

const MONGO_URI = process.env.MONGO_URI || "";
connectDB(MONGO_URI);

export default app;
```

- Creates one Express app instance.
- Loads environment variables.
- Configures JSON body parsing.
- Mounts all routes on `/`.
- Connects to MongoDB.
- **Exports `app`** for use in `server.ts`.

### `server.ts` — Entry Point

```typescript
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 8000;

const server = express();
server.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));
server.use(express.json());
server.use("/", app);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

- **Creates a SECOND Express app** (`server = express()`).
- Applies CORS on this second app.
- Mounts the `app` from `app.ts` as middleware on `/`.
- Starts listening.

> **⚠ Issue**: There are effectively two Express application instances. `server.use("/", app)` mounts the entire first app as a sub-app. This works but is redundant. CORS and JSON parsing are applied on the outer app, while routes and DB connect are on the inner app. A simpler approach would be to have everything in one Express instance.

---

## CORS Configuration

```typescript
server.use(cors({
  origin: "http://localhost:3000",   // frontend dev server
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));
```

- **Restricted to localhost:3000** (Next.js dev server) — good security practice.
- Allows all standard HTTP methods used by the frontend.
- Credentials enabled (cookies, though not actually used since JWT is in Authorization header).

---

## Middleware Stack

### Outer Server (`server.ts`)

| Order | Middleware          | Purpose                  |
|-------|---------------------|--------------------------|
| 1     | `cors()`            | Cross-origin requests    |
| 2     | `express.json()`    | Body parsing             |
| 3     | `app` (from app.ts) | Route handler sub-app    |

### Inner App (`app.ts`)

| Order | Middleware          | Purpose                  |
|-------|---------------------|--------------------------|
| 1     | `express.json()`    | Body parsing (redundant) |
| 2     | Routes on `/`       | API endpoints            |

---

## Route Tree

```
/ (index.ts)
  ├── GET /          → Welcome message
  ├── /users (userRoutes.ts)
  │   ├── POST /signup
  │   ├── POST /login
  │   ├── GET /me
  │   ├── GET /
  │   ├── GET /:id
  │   ├── PUT /:id
  │   ├── PATCH /:id
  │   └── DELETE /:id
  └── /tasks (taskRoutes.ts)
      ├── POST /
      ├── GET /
      ├── GET /date-range
      ├── GET /:id
      ├── PUT /:id
      ├── PATCH /:id
      ├── DELETE /:id
      ├── POST /:id/subtasks
      ├── PATCH /:id/subtasks/:subtaskId
      └── DELETE /:id/subtasks/:subtaskId
```

---

## Welcome Endpoint (`routes/index.ts`)

```typescript
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API! Server is running successfully.",
    version: "1.0.0",
    endpoints: {
      users: "/users",
      tasks: "/tasks",
      subtasks: "/subtasks"
    }
  });
});
```

- Health check / welcome endpoint.
- Returns API version and available endpoint paths.

---

## Observations

1. **Redundant middleware**: `express.json()` is applied in both `server.ts` and `app.ts` — the outer one handles parsing before the inner app receives the request.
2. **`dotenv` called twice**: Once in `app.ts` and once in `server.ts`. The second call is redundant but harmless.
3. **No helmet/compression**: Standard production middleware like `helmet` (security headers) and `compression` are not used.
4. **No error handling middleware**: No centralized `app.use((err, req, res, next) => {...})` error handler.
5. **No 404 handler**: Unmatched routes silently return Express's default 404 HTML.
6. **No logging**: Besides `console.log` statements, no logging library (Morgan, Winston, Pino) is configured.
7. **Port**: Defaults to `8000`, not the more common `5000` or `3001`.
