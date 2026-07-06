# Client — UI Components Deep Dive

## 1. Navbar (`components/Navbar.tsx`)

| Aspect          | Details |
|-----------------|---------|
| Type            | Client component (`"use client"`) |
| State           | `isClient` to prevent SSR mismatch |
| Navigation      | Links change based on auth: unauthed → just "Dashboard"; authed → "Dashboard" + "Charts" |
| Branding        | Logo (`logo.png`) + "TaskMaster" text (hidden on mobile) |
| Auth Actions    | Desktop: avatar circle, Logout button (authed) OR Login/Sign Up links (unauthed) |
| Mobile          | `@headlessui/react` Disclosure panel with hamburger menu |

## 2. Footer (`components/Footer.tsx`)

- Simple server component showing © {current year} and "Task Management System All rights reserved."
- Styled with `bg-gray-800 text-gray-300`.

## 3. HeroSection (`components/HeroSection.tsx`)

- Shown to unauthenticated users on the dashboard.
- Tagline: "Stay Organized. Stay Ahead."
- Title: "Task Management Dashboard"
- Subtext promoting TaskMaster.

## 4. Card (`components/Card.tsx`)

| Prop        | Type        |
|-------------|-------------|
| `icon`      | `ReactNode` |
| `title`     | `string`    |
| `description` | `string`  |

- Used on the guest landing to display 3 feature cards: Organize Tasks, Track Progress, Boost Productivity.
- Hover scale animation (`hover:scale-105`).

## 5. Clock (`components/Clock.tsx`)

- Live digital clock updated every second.
- 12-hour format with AM/PM.
- Responsive font sizing (`text-base` to `text-2xl`).

## 6. Greeting (`components/Greeting.tsx`)

- Time-based greeting ("Good Morning/Afternoon/Evening").
- Extracts first name from `user.name`.

## 7. Toast (`components/Toast.tsx`)

| Prop        | Type                          | Default   |
|-------------|-------------------------------|-----------|
| `message`   | `string`                      | required  |
| `color`     | `"green" | "red" | "blue"`   | `"blue"`  |
| `duration`  | `number`                      | `3000`    |
| `onClose`   | `() => void`                  | optional  |

- Fixed position at top-center, slides in/out with CSS transitions.
- Color mapping: green → `bg-green-500`, red → `bg-red-500`, blue → `bg-blue-500`.

## 8. Pagination (`components/Pagination.tsx`)

| Prop            | Type         |
|-----------------|--------------|
| `currentPage`   | `number`     |
| `totalPages`    | `number`     |
| `onPageChange`  | `(page: number) => void` |

- `< Prev` / `{currentPage} / {totalPages}` / `Next >` controls.
- Prev disabled at page 1, Next disabled at last page.

## 9. AuthForm (`components/AuthForm.tsx`)

- Dual-purpose: Login or Signup (controlled via `type: "login" | "signup"` prop).
- **Zod validation**: `signupSchema` (name, email, password, confirmPassword with .refine match check) and `loginSchema` (email + password).
- Fields: Name (signup only), Email, Password (with show/hide toggle via `lucide-react` Eye/EyeOff), Confirm Password (signup only).
- On success: stores token to localStorage, sets user via `AuthContext`, redirects to `/` with a green toast.
- On error: displays Zod validation issues OR Axios error messages in a red toast.

## 10. TaskForm (`components/TaskForm.tsx`)

| Prop          | Type                       |
|---------------|----------------------------|
| `user`        | `User`                     |
| `onClose`     | `() => void`               |
| `onTaskAdded` | `() => void`               |
| `task`        | `TaskType \| null`         |

- **Modal** overlay with backdrop blur. Click-outside-to-close.
- **Two-column layout**: Left (3/5) = form fields; Right (2/5) = user info card with avatar, name, email, quote.
- **Fields**: Title, Description (textarea), Status (select), Priority (select), Due Date (date input with min=today), Subtasks (dynamic array).
- **Add mode**: Submit button calls `POST /tasks`.
- **Edit mode** (when `task` prop provided): Auto-save via debounced `PATCH /tasks/:id` on every field change (800ms debounce). Delete button available.
- **Subtasks**: Add/Remove dynamically. Each subtask has title input + status select (pending/completed) + Remove button.

## 11. TaskItem (`components/TaskItem.tsx`)

- Card showing: Title, Description (line-clamp-3), Status, Priority, Due Date, Subtask chips.
- Clicking opens edit modal (via `onUpdate` callback).
- Used within `TaskSection` as a `Draggable` for drag-and-drop.

## 12. TaskList (`components/TaskList.tsx`)

- Grid layout of `TaskItem` components.
- Empty state: "No tasks yet. Start by adding your first one!"
- Responsive grid: 1 col (sm) → 2 (md) → 3 (lg) → 4 (xl).

## 13. TaskSection (`components/TaskSection.tsx`)

| Prop           | Type          |
|----------------|---------------|
| `title`        | `string`      |
| `tasks`        | `Task[]`      |
| `onUpdate`     | callback      |
| `onDelete`     | callback      |
| `droppableId`  | `string`      |

- `Droppable` container from `@hello-pangea/dnd`.
- Floating title label (`absolute -top-3`).
- Contains `TaskItem` as `Draggable` children.
- Three sections rendered by `page.tsx`: "Pending", "In Progress", "Completed".
