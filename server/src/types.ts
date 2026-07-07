// Plain TypeScript interfaces — no mongoose dependency

export interface IActivity {
  taskId: string;
  userId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

export interface ISearchIndex {
  taskId?: string;
  subtaskId?: string;
  title: string;
  content?: string;
  createdAt: Date;
}

export interface ISubtask {
  id?: string;
  title: string;
  status: "pending" | "completed";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITask {
  id?: string;
  title: string;
  description?: string;
  status: "pending" | "inprogress" | "completed";
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
  createdBy: string;
  subtasks: ISubtask[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  image?: string;
  role: "user" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
}
