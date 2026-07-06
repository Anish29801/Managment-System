# Client — Task Management

## Core Types (`type.ts`)

```typescript
interface Task {
  _id?: string;
  title: string;
  description?: string;
  status: "pending" | "inprogress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  subtasks: Subtask[];
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Subtask {
  _id?: string;
  title: string;
  status: "pending" | "completed";
  createdAt?: string;
  updatedAt?: string;
}
```

---

## Dashboard Page (`page.tsx`) — Main Task Management Hub

### State Management

| State            | Type                | Purpose                                  |
|------------------|---------------------|------------------------------------------|
| `tasks`          | `Task[]`            | All fetched tasks                        |
| `showForm`       | `boolean`           | Controls modal visibility                |
| `editingTask`    | `Task \| null`      | Task being edited (null = new task mode) |
| `searchQuery`    | `string`            | Search by title / description / subtask  |
| `startDate`      | `string` (YYYY-MM-DD)| Date range filter start                  |
| `endDate`        | `string` (YYYY-MM-DD)| Date range filter end                    |
| `toastMessage`   | `string \| null`     | Toast notification content               |

### Data Fetching

```typescript
const fetchTasks = async () => {
  const res = await axiosInstance.get<Task[]>("/tasks", {
    params: {
      search: searchQuery || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
  });
  setTasks(Array.isArray(res.data) ? res.data : []);
};
```

- Called via `useEffect` whenever `user`, `searchQuery`, `startDate`, or `endDate` changes.

### Task Operations

| Operation | Method   | Endpoint              | Trigger                    |
|-----------|----------|-----------------------|----------------------------|
| Create    | POST     | `/tasks`              | TaskForm submit (new mode) |
| Read      | GET      | `/tasks`              | Page load / filter change  |
| Update    | PUT      | `/tasks/:id`          | (not used directly)        |
| Partial   | PATCH    | `/tasks/:id`          | Auto-save in TaskForm      |
| Delete    | DELETE   | `/tasks/:id`          | TaskForm delete button     |
| Move      | PUT      | `/tasks/:id`          | Drag-and-drop status change|

---

## Drag-and-Drop (`@hello-pangea/dnd`)

- **3 columns**: `droppableId="pending"`, `"inprogress"`, `"completed"`.
- `DragDropContext.onDragEnd`:
  - Cancels if no destination or same column.
  - Maps droppableId to status string.
  - Calls `PUT /tasks/${draggableId}` with `{ status: newStatus }`.
  - Refetches tasks on success.

```typescript
const handleDragEnd = async (result: DropResult) => {
  if (!result.destination) return;
  if (source.droppableId === destination.droppableId) return;
  const newStatus = destination.droppableId === "pending" ? "pending"
    : destination.droppableId === "inprogress" ? "inprogress"
    : "completed";
  await axiosInstance.put(`/tasks/${draggableId}`, { status: newStatus });
  fetchTasks();
};
```

---

## Task Filters

### Search
- Text input with `FaSearch` icon.
- Debounced naturally via `useEffect` dependency — triggers API call on every keystroke.
- Server-side regex search across `title`, `description`, and `subtasks.title`.

### Date Range
- Two date inputs (start / end) with mutual constraint:
  - Start max = end date
  - End min = start date
- Server-side `$gte` / `$lte` filtering on `dueDate`.

### UI Layout
Filters are in a responsive grid inside a card (`bg-gray-800/70 p-4 rounded-xl`).

---

## TaskForm Modal — Auto-Save Feature

When editing an existing task:
- A `debounce` helper (custom, 800ms) delays the PATCH call.
- `useEffect` watches `[title, description, status, priority, dueDate, subtasks]`.
- On each change, `debouncedAutoUpdate` fires → `PATCH /tasks/:id`.
- A status indicator shows "Saving changes..." / "Edits are auto-saved."

```typescript
const debouncedAutoUpdate = useMemo(() => debounce(autoUpdate, 800), [task?._id]);
useEffect(() => {
  if (task?._id) {
    debouncedAutoUpdate({ title, description, status, priority, dueDate, subtasks });
  }
}, [title, description, status, priority, dueDate, subtasks]);
```
