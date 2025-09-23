import { Document, Types } from "mongoose";

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

// ✅ Fix: remove optional `_id` (Document already ensures _id exists)
export interface ISubtask extends Document {
  _id: Types.ObjectId; 
  title: string;
  status: "pending" | "completed";
  createdAt?: Date;
  updatedAt?: Date;
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

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}
