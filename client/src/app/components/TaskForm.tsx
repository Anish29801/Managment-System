"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { z, ZodError } from "zod";
import { useAuth } from "../context/AuthContext";
import { User } from "../type";import { Task as TaskType } from "../type";

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
    .refine(
      (val) => !val || new Date(val) >= new Date(new Date().toDateString()),
      { message: "Due date must be today or in the future" }
    ),
  subtasks: z.array(subtaskSchema).optional(),
});

/* ------------------------------ Props Types ---------------------------- */
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

  const [title, setTitle] = useState<string>(task?.title || "");
  const [description, setDescription] = useState<string>(task?.description || "");
  const [status, setStatus] = useState<"pending" | "inprogress" | "completed">(
    (task?.status as any) || "pending"
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    (task?.priority as any) || "medium"
  );
  const [dueDate, setDueDate] = useState<string>(task?.dueDate ? task.dueDate.split("T")[0] : "");
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

  /* ------------------------------- Render -------------------------------- */
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD for min attribute

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div ref={modalRef} className="w-full max-w-4xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex">
          {/* Left: Form */}
          <div className="w-full md:w-3/5 p-6">
            <h2 className={`text-xl font-semibold mb-4 bg-clip-text text-transparent ${color}`}>
              {task ? "Update Task" : "Add Task"}
            </h2>

            <form onSubmit={!task ? handleAdd : (e) => e.preventDefault()} className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-gray-300 block mb-1">Title</label>
                <input
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-gray-300 block mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Status + Priority */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-gray-300 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded bg-gray-700 text-white"
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
                    className="w-full px-3 py-2 rounded bg-gray-700 text-white"
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
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                  min={today} // prevent past dates
                />
              </div>

              {/* Subtasks */}
              <div className="p-3 bg-gray-800 rounded">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-semibold">Subtasks</h3>
                  <button type="button" onClick={addSubtask} className={`px-3 py-1 rounded text-white ${color}`}>
                    + Add Subtask
                  </button>
                </div>

                <div className="space-y-2">
                  {subtasks.length === 0 && <p className="text-gray-400 text-sm">No subtasks yet.</p>}
                  {subtasks.map((st, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        className="flex-1 px-3 py-2 rounded bg-gray-700 text-white"
                        placeholder="Subtask title"
                        value={st.title}
                        onChange={(e) => updateSubtask(idx, "title", e.target.value)}
                      />
                      <select
                        value={st.status}
                        onChange={(e) => updateSubtask(idx, "status", e.target.value)}
                        className="px-2 py-2 rounded bg-gray-700 text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeSubtask(idx)}
                        className="px-2 py-2 rounded bg-red-600 text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              {/* Action buttons */}
              <div className="flex gap-3 mt-2">
                {!task && (
                  <button
                    type="submit"
                    className={`flex-1 py-2 rounded text-white ${color} disabled:opacity-60`}
                    disabled={saving}
                  >
                    {saving ? "Adding..." : "Add Task"}
                  </button>
                )}

                {task && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-2 rounded bg-red-600 text-white disabled:opacity-60"
                    disabled={saving}
                  >
                    {saving ? "Deleting..." : "Delete Task"}
                  </button>
                )}
              </div>

              {task?._id && (
                <p className="text-gray-400 text-xs mt-1">
                  {saving ? "Saving changes..." : "Edits are auto-saved."}
                </p>
              )}
            </form>
          </div>

          {/* Right: User Info */}
          <aside className="hidden md:block md:w-2/5 bg-gray-700/20 p-6 border-l border-gray-600">
            <div className="h-full flex flex-col justify-start items-center text-center text-white">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${color}`}>
                <span className="text-xl font-bold">{user?.name?.[0] || "U"}</span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold">{user?.name || "Unknown User"}</h4>
                <p className="text-sm text-gray-200/80">{user?.email || "no-email@example.com"}</p>
              </div>

              <div className="text-left text-sm bg-gray-800/40 p-3 rounded w-full">
                <p className="text-gray-300 font-semibold mb-1">User Details</p>
                <p className="text-gray-200"><strong>Name:</strong> {user?.name}</p>
                <p className="text-gray-200"><strong>Email:</strong> {user?.email}</p>
              </div>

              <blockquote className="mt-6 text-blue-200 italic text-sm">
                "The only way to do great work is to love what you do."
              </blockquote>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
