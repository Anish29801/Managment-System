import { ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  color?: string;
}

export interface AuthContextType {
  user: User | null;
  color: string;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export interface Subtask {
  _id?: string;
  title: string;
  status: "pending" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  _id?: string;
  title: string;
  description?: string;
  status: "pending" | "inprogress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  subtasks: Subtask[];   // 👈 change from string[] to Subtask[]
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubtaskDTO {
  _id?: string; // Optional, because new subtasks may not have an ID yet
  title: string;
  status?: "pending" | "inprogress" | "completed"; // optional for creation
  createdAt?: Date;
  updatedAt?: Date;
  completed?: boolean; // optional boolean for frontend convenience
}

export interface ChartPayload {
  name: string;
  value: number;
  status: Task["status"];
}
export interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}
export interface CardProps {
  icon: ReactNode;
  title: string;
  description: string;
}