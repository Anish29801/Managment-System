# Client — Configuration & Routing

## Next.js Configuration (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  // No custom config — using defaults
};
export default nextConfig;
```

- Clean default config. No image domains, no rewrites, no webpack customization.

---

## TypeScript Configuration (`tsconfig.json`)

| Setting             | Value                  |
|---------------------|------------------------|
| target              | ES2017                 |
| module              | ESNext                 |
| moduleResolution    | Bundler                |
| jsx                 | preserve               |
| strict              | true                   |
| Path alias `@/`     | `./src/*`              |
| Path alias `@public/*` | `./public/*`        |
| plugins             | `[{ name: "next" }]`   |

---

## Tailwind CSS v4 (`globals.css` + `postcss.config.mjs`)

```css
@import "tailwindcss";
body {
  background-color: #0d1117;
  color: #ffffff;
}
```

- Uses the new Tailwind v4 `@import` syntax (not v3 `@tailwind` directives).
- PostCSS plugin: `@tailwindcss/postcss` only.
- Dark theme body (`#0d1117` background, white text).

---

## shadcn/ui Configuration (`components.json`)

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "gray",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

- Configured for shadcn/ui but **no shadcn components are actually used** in the codebase. The `cn()` utility and `components.json` are present as scaffolding.

---

## ESLint (`eslint.config.mjs`)

- Flat config extending `next/core-web-vitals` and `next/typescript`.
- Ignores: `node_modules`, `.next`, `out`, `build`, `next-env.d.ts`.

---

## Routing Structure (App Router)

| Path          | File                      | Auth Required | Purpose                 |
|---------------|---------------------------|---------------|-------------------------|
| `/`           | `app/page.tsx`             | No*           | Dashboard (tasks/DnD)   |
| `/login`      | `app/login/page.tsx`       | No            | Login form              |
| `/signup`     | `app/signup/page.tsx`      | No            | Registration form       |
| `/charts`     | `app/charts/page.tsx`      | Yes           | Analytics & charts      |
| `/*` (catch)  | `app/not-found.tsx`        | No            | 404 page                |

*`/` shows different content based on auth state; guest sees Hero + Cards, authenticated sees task board.

---

## Root Layout (`layout.tsx`)

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
```

- Poppins font via `next/font/google` with CSS variable `--font-poppins`.
- Body: `flex flex-col min-h-screen` for sticky footer pattern.
- **Global providers**: `AuthProvider` wraps everything.
- **Global layout**: Navbar (top) → Main content (flex-grow) → Footer (bottom).

---

## Custom 404 (`not-found.tsx`)

- Shows "404" → "Page not found" → "Sorry, we couldn't find the page you're looking for."
- Single CTA button: "Go back home" → links to `/`.
- Styled with `bg-indigo-400` for the 404 text and `bg-indigo-500` for the button.

---

## Package Scripts

| Script  | Command                        |
|---------|--------------------------------|
| `dev`   | `next dev --turbopack`         |
| `build` | `next build --turbopack`       |
| `start` | `next start`                   |
| `lint`  | `eslint`                       |

- Uses **Turbopack** for both dev and build (Next.js 15's Rust-based bundler).
