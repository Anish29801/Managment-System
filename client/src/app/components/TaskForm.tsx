"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import axiosInstance from "@/utils/axiosConfg"
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
      await axiosInstance.patch(`/tasks/${task._id}`, updatedTask);
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
      await axiosInstance.post("/tasks", payload);
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
      await axiosInstance.delete(`/tasks/${task._id}`);
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
      {/* Same JSX UI code you pasted — unchanged */}
    </div>
  );
};

export default TaskForm;
