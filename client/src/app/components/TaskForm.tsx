"use client";

import { useState } from "react";
import axios from "axios";
import { z, ZodError } from "zod";
import { User } from "../context/AuthContext";

interface TaskFormProps {
  user: User;
  onClose: () => void;
  onTaskAdded: () => void;
}

// Zod schema for validation
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "inprogress", "completed"]).default("pending"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
});

const TaskForm: React.FC<TaskFormProps> = ({ user, onClose, onTaskAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"pending" | "inprogress" | "completed">("pending");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      taskSchema.parse({ title, description, status, priority, dueDate });

      await axios.post(
        "http://localhost:8000/tasks",
        {
          title,
          description,
          status,
          priority,
          dueDate: dueDate || undefined,
          createdBy: user.id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      onTaskAdded(); // refresh task list
      onClose();     // close modal
    } catch (err: any) {
      if (err instanceof ZodError) setError(err.issues[0].message);
      else if (err.response?.data?.error) setError(err.response.data.error);
      else setError("Unexpected error occurred");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-md relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white font-bold"
      >
        X
      </button>
      <h2 className="text-xl font-bold mb-4 text-white">Add Task</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-gray-300">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md"
            required
          />
        </div>
        <div>
          <label className="text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md"
          />
        </div>
        <div>
          <label className="text-gray-300">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="text-gray-300">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="text-gray-300">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Create Task
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
