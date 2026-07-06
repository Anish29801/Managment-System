# Server — Models & Database Schemas

## TypeScript Interfaces (`types.ts`)

```typescript
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: "pending" | "inprogress" | "completed";
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
  createdBy: Types.ObjectId;
  subtasks: Types.DocumentArray<ISubtask>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubtask extends Document {
  _id: Types.ObjectId;
  title: string;
  status: "pending" | "completed";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IActivity extends Document {
  taskId: Types.ObjectId;
  userId: Types.ObjectId;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

export interface ISearchIndex extends Document {
  taskId?: Types.ObjectId;
  subtaskId?: Types.ObjectId;
  title: string;
  content?: string;
  createdAt: Date;
}
```

> **Note**: `IActivity` and `ISearchIndex` are defined but **not used** in any schema or route. They appear to be planned features.

---

## User Model (`model/User.ts`)

### Schema Definition

```typescript
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
```

### Fields

| Field      | Type     | Constraints                     |
|------------|----------|----------------------------------|
| `name`     | String   | required                         |
| `email`    | String   | required, unique                 |
| `password` | String   | required (bcrypt-hashed)         |
| `image`    | String   | optional (URL to avatar)         |
| `role`     | String   | enum: "user" / "admin", default "user" |
| `createdAt`| Date     | auto via `timestamps: true`      |
| `updatedAt`| Date     | auto via `timestamps: true`      |

---

## Task Model (`model/Task.ts`)

### Schema Definitions

```typescript
const subtaskSchema = new Schema<ISubtask>(
  {
    title: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" }
  },
  { timestamps: true }
);

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "inprogress", "completed"],
      default: "pending"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    dueDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subtasks: [subtaskSchema]   // embedded subdocuments
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", taskSchema);
```

### Fields

| Field         | Type     | Constraints                             |
|---------------|----------|------------------------------------------|
| `title`       | String   | required                                 |
| `description` | String   | optional                                 |
| `status`      | String   | enum: "pending" / "inprogress" / "completed", default "pending" |
| `priority`    | String   | enum: "low" / "medium" / "high", default "medium" |
| `dueDate`     | Date     | optional                                 |
| `createdBy`   | ObjectId | ref: "User", required                    |
| `subtasks`    | [Subtask]| array of embedded subdocuments           |
| `createdAt`   | Date     | auto via timestamps                      |
| `updatedAt`   | Date     | auto via timestamps                      |

### Subtask Subdocument

| Field      | Type     | Constraints                                    |
|------------|----------|-------------------------------------------------|
| `title`    | String   | required                                        |
| `status`   | String   | enum: "pending" / "completed", default "pending"|
| `createdAt`| Date     | auto via timestamps                             |
| `updatedAt`| Date     | auto via timestamps                             |

---

## Key Design Points

1. **Embedded vs Referenced**: Subtasks are **embedded** within the Task document (not a separate collection). This provides atomic reads/writes for a task and its subtasks, but doesn't allow querying subtasks independently.

2. **`timestamps: true`**: Both `User` and `Task` (and `Subtask`) use Mongoose timestamps, auto-adding `createdAt` and `updatedAt`.

3. **No password hashing in model**: Password hashing is done at the route level (in `userRoutes.ts`), not as a Mongoose pre-save hook. This means directly saving a User without going through the route could store plaintext passwords.

4. **`createdBy` ref**: Tasks are linked to users via `createdBy: { type: Schema.Types.ObjectId, ref: "User" }`. This enables `.populate("createdBy", "name email")` in queries.

5. **`role` field in User**: Supports "user" and "admin" roles, but no admin-specific middleware or authorization logic is currently implemented in routes.
