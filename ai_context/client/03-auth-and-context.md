# Client — Authentication & Context

## AuthContext (`context/AuthContext.tsx`)

### Structure

```typescript
interface AuthContextType {
  user: User | null;
  color: string;
  setUser: (user: User | null) => void;
  logout: () => void;
}
```

### Flow

1. **On mount** → `useEffect` checks `localStorage` for a `"token"`.
2. If token exists → calls `GET /users/me` via `axiosInstance`.
3. On success → assigns a deterministic avatar color based on the first character of the user's name:
   ```typescript
   const avatarColors = ["bg-blue-600", "bg-green-600", "bg-red-600", "bg-yellow-600", "bg-purple-600"];
   const color = avatarColors[name.charCodeAt(0) % avatarColors.length];
   ```
4. On failure (expired/invalid token) → clears user, removes token from localStorage.
5. **`logout()`** → removes token, sets user to `null`.

### Provider Placement

Wraps the entire app inside `RootLayout` (`layout.tsx`):
```tsx
<AuthProvider>
  <Navbar />
  <main>{children}</main>
  <Footer />
</AuthProvider>
```

### Hook

```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
```

---

## Login & Signup Routes

| Route     | Page Component   | Renders             |
|-----------|------------------|---------------------|
| `/login`  | `login/page.tsx` | `<AuthForm type="login" />`  |
| `/signup` | `signup/page.tsx`| `<AuthForm type="signup" />` |

- Both are simple thin wrappers around `AuthForm`.

---

## Token Management

| Action        | Location                          | Mechanism                        |
|---------------|-----------------------------------|----------------------------------|
| **Store**     | `AuthForm.tsx` (on login/signup)  | `localStorage.setItem("token", token)` |
| **Attach**    | `axiosConfg.ts` (request interceptor) | `config.headers.Authorization = Bearer ${token}` |
| **Remove**    | `AuthContext.tsx` (logout / fetch failure) | `localStorage.removeItem("token")` |
| **Redirect**  | `axiosConfg.ts` (response interceptor) | On 401 → redirect to `/login` (unless already there) |

---

## User Type

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  color?: string;   // assigned on client, not from server
}
```

---

## Security Notes

- JWT is stored in `localStorage` (vulnerable to XSS — acceptable for this project scope).
- Tokens expire in 1 hour (configured server-side).
- Axios interceptor handles automatic 401 redirects, except when the current path is already `/login`.
- No refresh token mechanism — user must log in again after expiry.
