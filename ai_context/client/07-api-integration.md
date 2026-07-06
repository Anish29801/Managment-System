# Client — API Integration Layer

## Axios Instance (`utils/axiosConfg.ts`)

### Base Configuration

```typescript
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
});
```

- All API calls go to `http://localhost:8000` (Express backend).

### Request Interceptor

```typescript
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

- Automatically reads JWT from `localStorage` and attaches `Authorization: Bearer <token>` header.
- Runs on every outgoing request — no manual header management needed.

### Response Interceptor

```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 &&
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

- On **401 Unauthorized**: removes token from localStorage, redirects to `/login`.
- **Skip redirect** if already on `/login` page (prevents redirect loops).
- Other errors are passed through to be handled by calling code (e.g., `ZodError` or `AxiosError` handling in components).

---

## API Endpoints Used

### User Endpoints

| Operation | Method | Endpoint         | Component              |
|-----------|--------|------------------|------------------------|
| Signup    | POST   | `/users/signup`  | `AuthForm.tsx`         |
| Login     | POST   | `/users/login`   | `AuthForm.tsx`         |
| Get Me    | GET    | `/users/me`      | `AuthContext.tsx`      |

### Task Endpoints

| Operation              | Method | Endpoint               | Component                 |
|------------------------|--------|------------------------|---------------------------|
| Create Task            | POST   | `/tasks`               | `TaskForm.tsx`            |
| Fetch Tasks (filtered) | GET    | `/tasks?search=&startDate=&endDate=` | `page.tsx` (Dashboard) |
| Fetch Single Task      | GET    | `/tasks/:id`           | (not used directly)       |
| Update Task (move)     | PUT    | `/tasks/:id`           | `page.tsx` (DnD handler)  |
| Partial Update (auto)  | PATCH  | `/tasks/:id`           | `TaskForm.tsx` (auto-save)|
| Delete Task            | DELETE | `/tasks/:id`           | `TaskForm.tsx`            |

### Subtask Endpoints

| Operation        | Method | Endpoint                        | Component        |
|------------------|--------|---------------------------------|------------------|
| Add Subtask      | POST   | `/tasks/:id/subtasks`           | (via auto-save)  |
| Update Subtask   | PATCH  | `/tasks/:id/subtasks/:subtaskId`| (via auto-save)  |
| Delete Subtask   | DELETE | `/tasks/:id/subtasks/:subtaskId`| (via auto-save)  |

> **Note**: Subtask operations are handled through the auto-save PATCH mechanism (the entire subtask array is sent in the body), so individual subtask endpoints are not directly called from the frontend.

---

## Error Handling Pattern

Throughout the app, errors are caught and displayed via Toast:

```typescript
try {
  const res = await axiosInstance.post(url, payload);
  // handle success
} catch (err) {
  if (err instanceof ZodError) {
    setToast({ message: err.issues[0].message, color: "red" });
  } else if (err instanceof AxiosError) {
    setToast({ message: err.response?.data?.error || "An error occurred", color: "red" });
  } else {
    setToast({ message: "An unexpected error occurred", color: "red" });
  }
}
```

- **ZodError**: Client-side validation errors (shown first issue only).
- **AxiosError**: Server response errors (e.g., "Email already registered").
- **Fallback**: Generic "An unexpected error occurred".

---

## CORS Configuration

The client expects the server to allow `http://localhost:3000` as origin. Server config:

```typescript
// server.ts
server.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));
```
