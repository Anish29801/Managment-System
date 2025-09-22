"use client";

import { useState } from "react";
import axios from "axios";
import { z, ZodError } from "zod";
import { User } from "../context/AuthContext";
import { Task } from "../type";

interface TaskFormProps {
  user: User;
  onClose: () => void;
  onTaskAdded: () => void;
  task?: Task | null;
}

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "inprogress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional(),
  subTasks: z.array(z.string()).optional(),
});

export const TaskForm: React.FC<TaskFormProps> = ({ user, task, onClose, onTaskAdded }) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<"pending" | "inprogress" | "completed">(task?.status || "pending");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split("T")[0] : "");
  const [subTasks, setSubTasks] = useState(task?.subtasks?.join(";") || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const subTasksArray = subTasks
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      taskSchema.parse({ title, description, status, priority, dueDate, subTasks: subTasksArray });

      if (task) {
        await axios.put(
          `http://localhost:8000/tasks/${task._id}`,
          { title, description, status, priority, dueDate, subTasks: subTasksArray },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } else {
        await axios.post(
          "http://localhost:8000/tasks",
          { title, description, status, priority, dueDate, subTasks: subTasksArray, createdBy: user.id },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      }

      onTaskAdded();
      onClose();
    } catch (err: any) {
      if (err instanceof ZodError) setError(err.issues[0].message);
      else if (err.response?.data?.error) setError(err.response.data.error);
      else setError("Unexpected error occurred");
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setError(null);
    try {
      await axios.delete(`http://localhost:8000/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      onTaskAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete task");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-md relative w-full max-w-md mx-auto">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white font-bold text-lg"
      >
        X
      </button>

      {/* Show task details if editing */}
      {task && (
        <div className="mb-4 p-4 bg-gray-700 rounded-md text-white">
          <h3 className="text-lg font-semibold mb-2">Task Details</h3>
          <p><strong>Title:</strong> {task.title}</p>
          {task.description && <p><strong>Description:</strong> {task.description}</p>}
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          {task.dueDate && <p><strong>Due Date:</strong> {task.dueDate.split("T")[0]}</p>}
          {task.subtasks && task.subtasks.length > 0 && (
            <p><strong>Subtasks:</strong> {task.subtasks.join(", ")}</p>
          )}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 text-white">{task ? "Update Task" : "Add Task"}</h2>

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
          {task?._id ? "Update Task" : "Create Task"}
        </button>

        {task?._id && (
          <button
            type="button"
            onClick={handleDelete}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            Delete Task
          </button>
        )}
      </form>
    </div>
  );
};

export default TaskForm;
