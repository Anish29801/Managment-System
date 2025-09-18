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

export interface ISubtask extends Document {
  taskId: Types.ObjectId;
  title: string;
  status: "pending" | "inprogress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: "pending" | "inprogress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  createdBy: Types.ObjectId;
  subtasks: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
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
