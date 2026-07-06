# Server — Database Configuration

## MongoDB Connection (`model/config/conn.ts`)

```typescript
import mongoose from "mongoose";

const connectDB = async (mongoURI: string) => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};

export default connectDB;
```

### Characteristics
- **Async connection** using `mongoose.connect()`.
- Called in `app.ts` with `process.env.MONGO_URI`.
- No retry logic — if the initial connection fails, it logs the error and the server continues running without DB access.
- No connection event listeners (e.g., `mongoose.connection.on("disconnected")`).

---

## Connection Flow

```
server.ts (entry)
  → dotenv.config()
  → imports app from ./app
  → app.ts runs:
      → dotenv.config()
      → creates Express app
      → sets up JSON parser
      → mounts routes on "/"
      → calls connectDB(MONGO_URI)
  → server.ts:
      → creates ANOTHER Express app
      → applies CORS
      → applies JSON parser
      → mounts app as middleware
      → listens on PORT
```

> **Note**: There are **two Express app instances** created — see `07-server-entry.md` for details. The DB connection is initiated from `app.ts` which is then mounted onto `server.ts`'s app.

---

## Environment Variable

```typescript
const MONGO_URI = process.env.MONGO_URI || "";
```

- If `MONGO_URI` is empty string, `mongoose.connect("")` will throw an error.
- The `.env` file is not committed (in `.gitignore`).

---

## Nodemon Configuration (`nodemon.json`)

```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["dist"],
  "exec": "ts-node src/server.ts"
}
```

- Watches the `src/` directory for changes to `.ts` and `.json` files.
- Executes via `ts-node` directly (no compile step during dev).
- Ignores the `dist/` build output directory.

---

## TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

| Setting             | Value     | Notes                        |
|---------------------|-----------|------------------------------|
| target              | ES2020    | Modern Node.js support       |
| module              | CommonJS  | Required for ts-node + Node  |
| rootDir             | src       | Source directory             |
| outDir              | dist      | Compiled JS output           |
| strict              | true      | Full strict type checking    |
| esModuleInterop     | true      | Enables default imports     |
| skipLibCheck        | true      | Skips d.ts type checking     |

---

## `.env` Template (from `.gitignore`)

Create a `.env` file in `server/` root:
```
PORT=8000
MONGO_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your-secret-key-here
```

---

## Production Build

```bash
npm run build    # tsc → outputs to dist/
npm start        # node dist/server.js
```

- Compiles TypeScript from `src/` to `dist/` as CommonJS.
- `dist/server.js` is the entry point.
- Environment variables must be set externally in production.
