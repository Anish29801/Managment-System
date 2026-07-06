# Server — Middleware & Authentication

## Auth Middleware (`middleware/auth.ts`) — **Active/Used**

This is the primary auth middleware used across all protected routes.

### Global Type Augmentation

```typescript
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
```

- Adds `userId` to Express's `Request` interface globally.
- This avoids having to use a custom `AuthRequest` type in every handler.

### JWT Payload Interface

```typescript
interface JwtPayload {
  id: string;
}
```

### Middleware Logic

```typescript
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = decoded.id;
    console.log("Decoded userId:", req.userId);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
```

### Flow
1. Extracts `Authorization` header.
2. Validates it starts with `"Bearer "`.
3. Splits off the token part.
4. Verifies the token with `jwt.verify()` using `JWT_SECRET` (or fallback `"supersecretkey"`).
5. On success: sets `req.userId = decoded.id`, calls `next()`.
6. On failure: returns 401 with `"Invalid or expired token"`.

### Usage

```typescript
import { verifyToken } from "../middleware/auth";

router.get("/", verifyToken, async (req: Request, res: Response) => {
  // req.userId is available here
});
```

---

## Task Auth Middleware (`middleware/taskAuth.ts`) — **Unused/Duplicate**

This file contains `authMiddleware` which is functionally identical to `auth.ts` but:

1. Does NOT use global type augmentation — instead defines a local `AuthRequest` interface.
2. Is **never imported or used** in any route file.

```typescript
interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // same logic as verifyToken
};
```

**Status**: This appears to be dead code — a leftover from an earlier iteration before the global type augmentation approach was adopted.

---

## JWT Configuration

| Parameter      | Value                        | Location                        |
|----------------|------------------------------|---------------------------------|
| Secret         | `process.env.JWT_SECRET \|\| "supersecretkey"` | `auth.ts`, `userRoutes.ts` |
| Algorithm      | HS256 (default)              | jsonwebtoken default            |
| Expiry         | 1 hour                       | `userRoutes.ts` (signup + login)|

### Token Payloads

| Route        | Payload                                    |
|--------------|--------------------------------------------|
| `/signup`    | `{ id: string, email: string }`            |
| `/login`     | `{ id: string, email: string, role: string }` |

---

## Security Observations

1. **Hardcoded fallback secret**: `"supersecretkey"` in plaintext — must be overridden in production `.env`.
2. **No refresh tokens**: Token expires in 1 hour; client must re-authenticate.
3. **`console.log` in middleware**: `console.log("Decoded userId:", req.userId)` leaks user IDs in production logs.
4. **Expired token handling**: Returns 401, which the client's Axios interceptor translates to redirecting to `/login`.
5. **No rate limiting**: Auth endpoints are unprotected against brute force attacks.
6. **No token blacklisting**: Logged-out tokens remain valid until expiry.
