"use client";

import { useState, useEffect, useMemo } from "react";
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
  // ---- State ----
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<"pending" | "inprogress" | "completed">(task?.status || "pending");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split("T")[0] : "");
  const [subTasks, setSubTasks] = useState(task?.subTasks?.join(";") || "");
  const [error, setError] = useState<string | null>(null);

  const [details, setDetails] = useState({
    title,
    description,
    status,
    priority,
    dueDate,
    subTasks: subTasks.split(";").filter(Boolean),
  });

  // ---- Debounce helper ----
  const debounce = (fn: Function, delay = 500) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // ---- Auto-update for edit mode ----
  const autoUpdate = async () => {
    if (!task?._id) return;

    const subTasksArray = subTasks.split(";").map((s) => s.trim()).filter(Boolean);

    try {
      taskSchema.parse({ title, description, status, priority, dueDate, subTasks: subTasksArray });

      await axios.patch(
        `http://localhost:8000/tasks/${task._id}`,
        { title, description, status, priority, dueDate, subTasks: subTasksArray },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setDetails({ title, description, status, priority, dueDate, subTasks: subTasksArray });
      onTaskAdded();
    } catch (err: any) {
      if (err instanceof ZodError) setError(err.issues[0].message);
      else if (err.response?.data?.error) setError(err.response.data.error);
      else setError("Unexpected error occurred");
    }
  };

  const debouncedAutoUpdate = useMemo(() => debounce(autoUpdate, 500), [title, description, status, priority, dueDate, subTasks]);

  useEffect(() => {
    if (task?._id) debouncedAutoUpdate();
  }, [title, description, status, priority, dueDate, subTasks]);

  // ---- Add Task ----
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const subTasksArray = subTasks.split(";").map((s) => s.trim()).filter(Boolean);

    try {
      taskSchema.parse({ title, description, status, priority, dueDate, subTasks: subTasksArray });

      await axios.post(
        "http://localhost:8000/tasks",
        { title, description, status, priority, dueDate, subTasks: subTasksArray, createdBy: user.id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      onTaskAdded();
      onClose();
    } catch (err: any) {
      if (err instanceof ZodError) setError(err.issues[0].message);
      else if (err.response?.data?.error) setError(err.response.data.error);
      else setError("Failed to add task");
    }
  };

  // ---- Delete Task ----
  const handleDelete = async () => {
    if (!task?._id) return;
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
      <button onClick={onClose} className="absolute top-2 right-2 text-white font-bold text-lg">X</button>

      {/* Live details when editing */}
      {task && (
        <div className="mb-4 p-4 bg-gray-700 rounded-md text-white">
          <h3 className="text-lg font-semibold mb-2">Task Details</h3>
          <p><strong>Title:</strong> {details.title}</p>
          {details.description && <p><strong>Description:</strong> {details.description}</p>}
          <p><strong>Status:</strong> {details.status}</p>
          <p><strong>Priority:</strong> {details.priority}</p>
          {details.dueDate && <p><strong>Due Date:</strong> {details.dueDate}</p>}
          {details.subTasks.length > 0 && <p><strong>Subtasks:</strong> {details.subTasks.join(", ")}</p>}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 text-white">{task ? "Update Task" : "Add Task"}</h2>

      <form className="space-y-3" onSubmit={!task ? handleAdd : undefined}>
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

        <div>
          <label className="text-gray-300">Sub Tasks (separate by ;)</label>
          <textarea
            value={subTasks}
            onChange={(e) => setSubTasks(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md resize-y"
            placeholder="Subtask1; Subtask2; Subtask3"
            rows={4}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!task && (
          <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
            Add Task
          </button>
        )}

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
