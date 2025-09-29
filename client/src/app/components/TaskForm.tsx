"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { z, ZodError } from "zod";
import { useAuth } from "../context/AuthContext";
import { User, Task as TaskType } from "../type";

/* ----------------------------- Zod Schemas ----------------------------- */
const subtaskSchema = z.object({
  title: z.string().min(1, "Subtask title is required"),
  status: z.enum(["pending", "completed"]).default("pending"),
});

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "inprogress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z
    .string()
    .optional()
    .refine((val) => !val || new Date(val) >= new Date(new Date().toDateString()), {
      message: "Due date must be today or in the future",
    }),
  subtasks: z.array(subtaskSchema).optional(),
});

interface TaskFormProps {
  user: User;
  onClose: () => void;
  onTaskAdded: () => void;
  task?: TaskType | null;
}

/* ---------------------------- Debounce Helper -------------------------- */
const debounce = (fn: (...args: any[]) => void, delay = 800) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const TaskForm: React.FC<TaskFormProps> = ({ user, task, onClose, onTaskAdded }) => {
  const { color } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<"pending" | "inprogress" | "completed">(
    (task?.status as any) || "pending"
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    (task?.priority as any) || "medium"
  );
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split("T")[0] : "");
  const [subtasks, setSubtasks] = useState<{ title: string; status: "pending" | "completed" }[]>(
    (Array.isArray((task as any)?.subtasks) ? (task as any).subtasks : []) || []
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ----------------------------- Auto Update ------------------------------ */
  const autoUpdate = async (updatedTask: any) => {
    if (!task?._id) return;
    try {
      taskSchema.parse(updatedTask);
      setSaving(true);
      await axios.patch(`http://localhost:8000/tasks/${task._id}`, updatedTask, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSaving(false);
      setError(null);
    } catch (err: any) {
      setSaving(false);
      if (err instanceof ZodError) setError(err.issues[0].message);
      else setError(err?.response?.data?.error || "Auto-update failed");
    }
  };

  const debouncedAutoUpdate = useMemo(() => debounce(autoUpdate, 800), [task?._id]);

  useEffect(() => {
    if (task?._id) {
      debouncedAutoUpdate({ title, description, status, priority, dueDate, subtasks });
    }
  }, [title, description, status, priority, dueDate, subtasks]);

  /* ------------------------------- Handlers ------------------------------- */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = { title, description, status, priority, dueDate, subtasks, createdBy: user.id };
      taskSchema.parse(payload);
      setSaving(true);
      await axios.post("http://localhost:8000/tasks", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSaving(false);
      onTaskAdded();
      onClose();
    } catch (err: any) {
      setSaving(false);
      if (err instanceof ZodError) setError(err.issues[0].message);
      else setError(err?.response?.data?.error || "Failed to add task");
    }
  };

  const handleDelete = async () => {
    if (!task?._id) return;
    setError(null);
    try {
      setSaving(true);
      await axios.delete(`http://localhost:8000/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSaving(false);
      onTaskAdded();
      onClose();
    } catch (err: any) {
      setSaving(false);
      setError(err?.response?.data?.error || "Failed to delete task");
    }
  };

  const addSubtask = () => setSubtasks([...subtasks, { title: "", status: "pending" }]);
  const updateSubtask = (index: number, field: "title" | "status", value: string) => {
    const copy = [...subtasks];
    (copy[index] as any)[field] = value;
    setSubtasks(copy);
  };
  const removeSubtask = (index: number) => setSubtasks(subtasks.filter((_, i) => i !== index));

  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onTaskAdded();
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date().toISOString().split("T")[0];

  /* ------------------------------- Render -------------------------------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto">
      <div
        ref={modalRef}
        className="w-full max-w-5xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
      >
        {/* Left: Form */}
        <div className="w-full md:w-3/5 p-6 overflow-y-auto max-h-[90vh]">
          <h2 className={`text-2xl font-bold mb-6 bg-clip-text text-transparent ${color}`}>
            {task ? "Update Task" : "Add Task"}
          </h2>

          <form onSubmit={!task ? handleAdd : (e) => e.preventDefault()} className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-gray-300 block mb-1">Title</label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-gray-300 block mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Status + Priority */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-gray-300 block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="pending">Pending</option>
                  <option value="inprogress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-gray-300 block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-gray-300 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 transition"
                min={today}
              />
            </div>

            {/* Subtasks */}
            <div className="p-4 bg-gray-800/60 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-semibold">Subtasks</h3>
                <button
                  type="button"
                  onClick={addSubtask}
                  className={`px-3 py-1.5 rounded-lg font-medium text-white ${color} hover:opacity-90 transition`}
                >
                  + Add Subtask
                </button>
              </div>

              <div className="space-y-2 transition-all duration-300 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {subtasks.length === 0 && <p className="text-gray-400 text-sm">No subtasks yet.</p>}
                {subtasks.map((st, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center bg-gray-800/50 p-2 rounded-lg"
                  >
                    <input
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400
                                 focus:ring-2 focus:ring-indigo-500 transition"
                      placeholder="Subtask title"
                      value={st.title}
                      onChange={(e) => updateSubtask(idx, "title", e.target.value)}
                    />
                    <select
                      value={st.status}
                      onChange={(e) => updateSubtask(idx, "status", e.target.value)}
                      className="px-2 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 transition"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeSubtask(idx)}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              {!task && (
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-lg font-medium text-white ${color} hover:opacity-90 transition disabled:opacity-60`}
                  disabled={saving}
                >
                  {saving ? "Adding..." : "Add Task"}
                </button>
              )}

              {task && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Deleting..." : "Delete Task"}
                </button>
              )}
            </div>

            {task?._id && (
              <p className="text-gray-400 text-xs mt-2">
                {saving ? "Saving changes..." : "Edits are auto-saved."}
              </p>
            )}
          </form>
        </div>

        {/* Right: User Info */}
        <aside className="w-full md:w-2/5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 border-t md:border-t-0 md:border-l border-gray-700 flex flex-col items-center text-center max-h-[90vh] overflow-y-auto">
          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 text-white shadow-lg ${color}`}>
            <span className="text-lg md:text-xl font-bold">{user?.name?.[0] || "U"}</span>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-lg">{user?.name || "Unknown User"}</h4>
            <p className="text-sm text-gray-300">{user?.email || "no-email@example.com"}</p>
          </div>

          <div className="text-left text-sm bg-gray-800/60 p-4 rounded-lg w-full shadow-inner">
            <p className="text-gray-300 font-semibold mb-2">User Details</p>
            <p className="text-gray-200"><strong>Name:</strong> {user?.name}</p>
            <p className="text-gray-200"><strong>Email:</strong> {user?.email}</p>
          </div>

          <blockquote className="mt-6 text-blue-200 italic text-sm">
            "The only way to do great work is to love what you do."
          </blockquote>
        </aside>
      </div>
    </div>
  );
};

export default TaskForm;
