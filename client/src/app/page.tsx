"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import TaskForm from "./components/TaskForm";
import { TaskSection } from "./components/TaskSection";
import { Task } from "./type";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (user) fetchTasks();
    else setTasks([]);
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Task[]>("http://localhost:8000/tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(res.data);
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err.response?.data || err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleUpdate = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!user) return;
    try {
      await axios.delete(`http://localhost:8000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchTasks();
    } catch (err: any) {
      console.error("Failed to delete task:", err.response?.data || err.message);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "inprogress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const greeting = user
    ? `Hi, ${user.name} Good ${getTimeOfDay()}`
    : "Hi, Guest";

  function getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{greeting}</h1>
        <button
          onClick={handleAddClick}
          disabled={!user}
          className={`px-4 py-2 rounded-md ${
            user ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          Add Task
        </button>
      </div>

      {loading ? (
        <p className="text-center mt-10">Loading...</p>
      ) : !user ? (
        <p className="text-red-400 text-lg font-semibold text-center mt-10">
          Please Login
        </p>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          <TaskSection
            title="Pending"
            tasks={pendingTasks}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
          <TaskSection
            title="In Progress"
            tasks={inProgressTasks}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
          <TaskSection
            title="Completed"
            tasks={completedTasks}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md">
            <TaskForm
              user={user}
              task={editingTask}
              onClose={() => setShowForm(false)}
              onTaskAdded={fetchTasks}
            />
          </div>
        </div>
      )}
    </div>
  );
}
