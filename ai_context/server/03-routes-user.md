# Server — User Routes (`routes/userRoutes.ts`)

## Route Overview

| Method   | Path         | Auth Required | Description                  |
|----------|--------------|---------------|------------------------------|
| POST     | `/users/signup` | No          | Register new user            |
| POST     | `/users/login`  | No          | Authenticate user            |
| GET      | `/users/me`     | Yes         | Get current user profile     |
| GET      | `/users`        | No          | List all users               |
| GET      | `/users/:id`    | No          | Get single user by ID        |
| PUT      | `/users/:id`    | No          | Full update user             |
| PATCH    | `/users/:id`    | No          | Partial update user          |
| DELETE   | `/users/:id`    | No          | Delete user                  |

---

## POST `/users/signup` — Registration

### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user"           // optional, defaults to "user"
}
```

### Validation
- All three fields (name, email, password) are required (returns 400 if missing).
- Email uniqueness is checked via `User.findOne({ email })`.
- No email format validation (e.g., Zod or regex) is applied server-side.

### Password Hashing
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

### Response (201)
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

### Token Payload
```typescript
jwt.sign({ id: savedUser._id, email: savedUser.email }, JWT_SECRET, { expiresIn: "1h" });
```

---

## POST `/users/login` — Authentication

### Request Body
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Validation
- Checks user existence via email.
- Compares password with `bcrypt.compare`.

### Response (200)
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "user" }
}
```

### Token Payload
```typescript
jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
```

> **Difference from signup**: Login token includes `role` in payload; signup token does not. This is inconsistent.

### Error Responses
- 400: "Invalid email or password" (same message for both not-found and wrong-password — security best practice).

---

## GET `/users/me` — Current User Profile

- **Auth required** (via `verifyToken` middleware).
- Uses `req.userId` (set by middleware) to find the user.
- Excludes password from response via `.select("-password")`.
- Returns `{ user: { id, name, email } }`.

---

## GET `/users` — List All Users

- No auth required (potential security concern — exposes all registered users).
- Password excluded via `.select("-password")`.

---

## GET `/users/:id` — Get Single User

- No auth required.
- Returns 404 if not found.
- Password excluded.

---

## PUT `/users/:id` — Full Update

- Updates name, email, role, and optionally password.
- If password provided → hashes it before saving.
- Uses `findByIdAndUpdate` with `{ new: true }`.

---

## PATCH `/users/:id` — Partial Update

- Spreads `req.body` into update data.
- If password is in body → hashes it.
- No selective field update — spreads entire body.

---

## DELETE `/users/:id` — Delete User

- Uses `findByIdAndDelete`.
- Returns success message with deleted user name.

---

## Security Observations

1. **No auth on GET `/users` and GET `/users/:id`** — Anyone can enumerate users.
2. **No auth on PUT/PATCH/DELETE `/users/:id`** — Anyone can modify or delete any user if they know the ID.
3. **Hardcoded JWT secret fallback**: `process.env.JWT_SECRET || "supersecretkey"` — insecure default.
4. **Token expiry**: 1 hour, no refresh token mechanism.
5. **Inconsistent token payloads**: Signup token lacks `role`, login token includes it.
