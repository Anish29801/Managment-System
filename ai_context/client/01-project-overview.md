# Client — Project Overview

## General Description
The client is a **Task Management Dashboard** built with **Next.js 15 (App Router)** and **React 19**. It provides a full UI for authenticated users to create, read, update, delete, drag-and-drop, filter, and visualize tasks. Unauthenticated users see a hero section + feature cards and are prompted to log in.

---

## Tech Stack

| Layer          | Technology                                                  |
|----------------|-------------------------------------------------------------|
| Framework      | Next.js 15.5.3 (App Router, Turbopack)                      |
| UI Library     | React 19.1.0                                                |
| Language       | TypeScript 5                                                 |
| Styling        | Tailwind CSS v4 (PostCSS)                                   |
| Font           | Poppins (via `next/font/google`)                            |
| Icons          | `react-icons` (Fa), `lucide-react`, `@heroicons/react`      |
| Drag & Drop    | `@hello-pangea/dnd` (fork of `react-beautiful-dnd`)         |
| Charts         | `recharts` (Pie/Donut + Bar charts)                         |
| Forms / Validation | `react-hook-form`, `zod` (client & server compatible)   |
| HTTP Client    | `axios` with interceptors                                   |
| UI Primitives  | `@headlessui/react` (Disclosure for mobile nav)             |
| State / Auth   | React Context (`AuthContext`)                                |
| Utilities      | `clsx` + `tailwind-merge` (for `cn()` helper), `lodash.debounce` |

---

## Project Structure

```
client/
├── public/
│   └── logo.png
├── src/
│   ├── app/
│   │   ├── charts/page.tsx          # Recharts analytics page
│   │   ├── components/              # All UI components
│   │   │   ├── AuthForm.tsx         # Login / Signup form
│   │   │   ├── Card.tsx             # Feature card
│   │   │   ├── Clock.tsx            # Live clock display
│   │   │   ├── Footer.tsx           # App footer
│   │   │   ├── Greeting.tsx         # Time-based greeting
│   │   │   ├── HeroSection.tsx      # Landing hero for guests
│   │   │   ├── Navbar.tsx           # Responsive navbar
│   │   │   ├── Pagination.tsx       # Pagination controls
│   │   │   ├── TaskForm.tsx         # Create/Edit task modal
│   │   │   ├── TaskItem.tsx         # Single task card
│   │   │   ├── TaskList.tsx         # Grid list of tasks
│   │   │   ├── TaskSection.tsx      # Droppable column section
│   │   │   └── Toast.tsx            # Animated toast notification
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Global auth state provider
│   │   ├── login/page.tsx           # Login route
│   │   ├── signup/page.tsx          # Signup route
│   │   ├── globals.css              # Tailwind v4 imports + body styles
│   │   ├── layout.tsx               # Root layout (AuthProvider, Navbar, Footer)
│   │   ├── not-found.tsx            # Custom 404 page
│   │   ├── page.tsx                 # Main Dashboard (tasks, filters, DnD)
│   │   └── type.ts                  # Shared TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts                 # cn() helper for Tailwind classes
│   └── utils/
│       └── axiosConfg.ts            # Axios instance with interceptors
├── components.json                  # shadcn/ui configuration
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.mjs                # ESLint flat config
└── postcss.config.mjs               # PostCSS with @tailwindcss/postcss
```

---

## Key Architecture Decisions

1. **Next.js App Router** with `"use client"` on all interactive pages (no RSC for dynamic features yet).
2. **Global Auth via React Context** — `AuthProvider` wraps the root layout, stores user + token in `localStorage`.
3. **Drag-and-drop** uses `@hello-pangea/dnd` (the maintained fork of `react-beautiful-dnd`) with 3 columns: Pending → In Progress → Completed.
4. **Auto-save on edit** — `TaskForm` uses a debounced auto-update that `PATCH`es the server on every field change (800ms debounce).
5. **Axios interceptor** automatically attaches JWT from localStorage and redirects to `/login` on 401.
6. **Charts** page uses `recharts` with a donut chart + bar chart, filterable by Full Dataset / Last 3 Months / Last Month.
7. **Tailwind CSS v4** with the new `@import "tailwindcss"` syntax (instead of v3 `@tailwind` directives).
8. **Mobile-first responsive design** — all components use responsive grid/flex layouts.
