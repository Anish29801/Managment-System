import { Types } from "mongoose";

export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "inprogress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdBy: string;
   subtasks: string[];
}
export interface SubtaskDTO {
  _id?: Types.ObjectId | string; // Optional, because new subtasks may not have an ID yet
  title: string;
  status?: "pending" | "inprogress" | "completed"; // optional for creation
  createdAt?: Date;
  updatedAt?: Date;
  completed?: boolean; // optional boolean for frontend convenience
}