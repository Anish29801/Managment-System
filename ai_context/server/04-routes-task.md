# Server — Task Routes (`routes/taskRoutes.ts`)

## Route Overview

| Method   | Path                                | Auth Required | Description                    |
|----------|-------------------------------------|---------------|--------------------------------|
| POST     | `/tasks`                            | Yes           | Create new task                |
| GET      | `/tasks`                            | Yes           | Get user's tasks (filtered)    |
| GET      | `/tasks/date-range`                 | Yes           | Get tasks by date range        |
| GET      | `/tasks/:id`                        | Yes           | Get single task                |
| PUT      | `/tasks/:id`                        | Yes           | Full update task               |
| PATCH    | `/tasks/:id`                        | Yes           | Partial update task            |
| DELETE   | `/tasks/:id`                        | Yes           | Delete task                    |
| POST     | `/tasks/:id/subtasks`               | Yes           | Add subtask to task            |
| PATCH    | `/tasks/:id/subtasks/:subtaskId`    | Yes           | Update a subtask               |
| DELETE   | `/tasks/:id/subtasks/:subtaskId`    | Yes           | Delete a subtask               |

> **Note**: All task routes require `verifyToken`. The `createdBy` field is always set or filtered to `req.userId`.

---

## POST `/tasks` — Create Task

### Request Body
```json
{
  "title": "Build login page",
  "description": "Implement JWT auth on frontend",
  "status": "pending",
  "dueDate": "2026-08-01",
  "subtasks": [
    { "title": "Design form", "status": "pending" }
  ]
}
```

### Logic
- `createdBy` is set to `req.userId` (from JWT).
- `status` defaults to `"pending"` if not provided.
- `subtasks` defaults to `[]` if not provided.
- Title is required (400 if missing).

---

## GET `/tasks` — Get User's Tasks (Filtered)

### Query Parameters
| Parameter   | Type     | Description                             |
|-------------|----------|-----------------------------------------|
| `search`    | string   | Regex search on title, description, subtask title |
| `startDate` | string   | ISO date string — filter tasks with dueDate >= this |
| `endDate`   | string   | ISO date string — filter tasks with dueDate <= this |

### Search Logic
```typescript
const regex = new RegExp(search, "i");
query.$and = [
  { createdBy: userId },
  { $or: [
    { title: regex },
    { description: regex },
    { "subtasks.title": regex }
  ]}
];
```

- Case-insensitive regex search across 3 fields.
- **Important**: If only `search` is provided, query uses `$and: [ { createdBy }, { $or: [...] } ]`.
- If `startDate`/`endDate` is ALSO provided, it's pushed into the same `$and` array.

### Date Filter Logic
- Both `$gte` (startDate) and `$lte` (endDate) are optional.
- If no search param, a simpler query is built: `{ createdBy, dueDate: { $gte, $lte } }`.

### Response
Returns array of tasks with populated `createdBy` (select: "name email").

---

## GET `/tasks/date-range` — Get Tasks by Date Range

### Query Parameters
| Parameter   | Type     | Required |
|-------------|----------|----------|
| `startDate` | string   | No (but at least one required) |
| `endDate`   | string   | No (but at least one required) |

- Returns 400 if neither startDate nor endDate provided.
- Simpler than the main GET handler — no search, just date filter.

---

## GET `/tasks/:id` — Get Single Task

- Scoped to `req.userId` — users can only fetch their own tasks.
- Returns 404 if not found.

---

## PUT `/tasks/:id` — Update Task

- Scoped to `req.userId` + `_id`.
- Uses `findOneAndUpdate` with `{ new: true, runValidators: true }`.

---

## PATCH `/tasks/:id` — Partial Update

- Same as PUT — identical implementation using `findOneAndUpdate`.
- **Issue**: PUT and PATCH have identical implementations. Both use `req.body` directly without validation. Should differentiate (PUT = full replace, PATCH = partial merge), but Mongoose handles this similarly since both merge by default.

---

## DELETE `/tasks/:id` — Delete Task

- Scoped to `req.userId` + `_id`.
- Returns success message with deleted task title.

---

## Subtask Routes

### POST `/tasks/:id/subtasks` — Add Subtask
- Pushes a new subtask document to the `subtasks` array.
- `title` and `status` from body; status defaults to `"pending"`.

### PATCH `/tasks/:id/subtasks/:subtaskId` — Update Subtask
- Uses Mongoose `subdocs.id()` to find the specific subtask.
- Calls `.set(req.body)` to apply updates.
- Saves the parent task.

### DELETE `/tasks/:id/subtasks/:subtaskId` — Delete Subtask
- Uses Mongoose `subdocs.id()` + `.deleteOne()`.
- Saves the parent task.

---

## Query Pattern Consistency

All task-scoped routes follow the same pattern:
```typescript
await Task.findOne({ _id: req.params.id, createdBy: req.userId });
```
This ensures users can only access their own tasks.

---

## Observations & Potential Issues

1. **PUT and PATCH are identical** — no semantic difference in implementation.
2. **No input validation (Zod)** — `zod` is in `package.json` but never used for request body validation on the server.
3. **Search regex is applied client-provided without sanitization** — while this is a NoSQLi concern, Mongoose doesn't evaluate `$regex` dangerously in the same way as SQL. However, ReDoS (malicious regex) is a theoretical concern.
4. **No pagination** — All tasks are returned at once. Could become a performance issue for users with many tasks.
5. **Subtask routes use `status: "pending" | "completed"` while parent task uses `"pending" | "inprogress" | "completed"`** — different enum values for different levels.
