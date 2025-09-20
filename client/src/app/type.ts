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
