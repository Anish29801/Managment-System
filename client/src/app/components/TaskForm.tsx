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

const subtaskSchema = z.object({
  title: z.string().min(1, "Subtask title is required"),
  status: z.enum(["pending", "completed"]).default("pending"),
});

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "inprogress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional(),
  subtasks: z.array(subtaskSchema).optional(),
});

// ---- Debounce helper ----
const debounce = (fn: Function, delay = 800) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const TaskForm: React.FC<TaskFormProps> = ({ user, task, onClose, onTaskAdded }) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<"pending" | "inprogress" | "completed">(task?.status || "pending");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split("T")[0] : "");
  const [subtasks, setSubtasks] = useState<{ title: string; status: "pending" | "completed" }[]>(task?.subtasks || []);
  const [error, setError] = useState<string | null>(null);

  // ---- Auto Update ----
  const autoUpdate = async (updatedTask: any) => {
    if (!task?._id) return;
    try {
      taskSchema.parse(updatedTask);
      await axios.patch(
        `http://localhost:8000/tasks/${task._id}`,
        updatedTask,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      // ❌ do not call onTaskAdded here → prevents dashboard flicker
    } catch (err: any) {
      if (err instanceof ZodError) setError(err.issues[0].message);
      else setError(err.response?.data?.error || "Unexpected error occurred");
    }
  };

  // Stable debounce
  const debouncedAutoUpdate = useMemo(() => debounce(autoUpdate, 800), []);

  // Auto update when editing existing task
  useEffect(() => {
    if (task?._id) {
      debouncedAutoUpdate({ title, description, status, priority, dueDate, subtasks });
    }
  }, [title, description, status, priority, dueDate, subtasks]);

  // ---- Handlers ----
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      taskSchema.parse({ title, description, status, priority, dueDate, subtasks });
      await axios.post(
        "http://localhost:8000/tasks",
        { title, description, status, priority, dueDate, subtasks, createdBy: user.id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      onTaskAdded();
      onClose();
    } catch (err: any) {
      if (err instanceof ZodError) setError(err.issues[0].message);
      else setError(err.response?.data?.error || "Failed to add task");
    }
  };

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

  // ---- Subtask Handlers ----
  const addSubtask = () => setSubtasks([...subtasks, { title: "", status: "pending" }]);
  const updateSubtask = (index: number, field: "title" | "status", value: string) => {
    const updated = [...subtasks];
    (updated[index] as any)[field] = value;
    setSubtasks(updated);
  };
  const deleteSubtask = (index: number) => setSubtasks(subtasks.filter((_, i) => i !== index));

  return (
    <div className="bg-gray-800 p-6 rounded-md relative w-full max-w-md mx-auto">
      {/* Close Button */}
      <button
        onClick={() => {
          onTaskAdded(); // refresh dashboard only once when form closes
          onClose();
        }}
        className="absolute top-2 right-2 text-white font-bold text-lg"
      >
        X
      </button>

      <h2 className="text-xl font-bold mb-4 text-white">{task ? "Update Task" : "Add Task"}</h2>

      {/* Show existing details as labels on top (read-only) */}
      {task && (
        <div className="mb-4 p-3 bg-gray-700 rounded-md text-sm text-gray-300 space-y-1">
          <p><strong>Current Title:</strong> {task.title}</p>
          <p><strong>Description:</strong> {task.description || "—"}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Due Date:</strong> {task.dueDate?.split("T")[0] || "—"}</p>
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <strong>Subtasks:</strong>
              <ul className="list-disc list-inside">
                {task.subtasks.map((st, i) => (
                  <li key={i}>
                    {st.title} ({st.status})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <form className="space-y-3" onSubmit={!task ? handleAdd : undefined}>
        {/* Title */}
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

        {/* Description */}
        <div>
          <label className="text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md"
          />
        </div>

        {/* Status & Priority */}
        <div className="flex gap-2">
          <div className="flex-1">
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

          <div className="flex-1">
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
        </div>

        {/* Due Date */}
        <div>
          <label className="text-gray-300">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md"
          />
        </div>

        {/* Subtasks */}
        <div className="mt-4 p-3 bg-gray-700 rounded-md">
          <label className="text-gray-300 font-semibold">Subtasks</label>
          {subtasks.map((st, i) => (
            <div key={i} className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={st.title}
                onChange={(e) => updateSubtask(i, "title", e.target.value)}
                placeholder="Subtask title"
                className="flex-1 px-3 py-2 rounded-md bg-gray-600 text-white"
              />
              <select
                value={st.status}
                onChange={(e) => updateSubtask(i, "status", e.target.value)}
                className="px-2 py-2 rounded-md bg-gray-600 text-white"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <button
                type="button"
                onClick={() => deleteSubtask(i)}
                className="px-2 py-2 bg-red-600 rounded-md text-white"
              >
                X
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSubtask}
            className="mt-3 px-3 py-2 bg-blue-600 text-white rounded-md"
          >
            + Add Subtask
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        {!task && (
          <button type="submit" className="w-full mt-4 py-2 bg-blue-600 text-white rounded-md">
            Add Task
          </button>
        )}

        {task && (
          <button
            type="button"
            onClick={handleDelete}
            className="w-full mt-4 py-2 bg-red-600 text-white rounded-md"
          >
            Delete Task
          </button>
        )}
      </form>
    </div>
  );
};

export default TaskForm;
