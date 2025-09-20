"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import TaskForm from "./components/TaskForm";
import { Greeting } from "./components/Greeting";
import { TaskList } from "./components/TaskList";
import { Task } from "./components/TaskList"; 

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (user) fetchTasks();
    else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/tasks", {
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

  const handleUpdate = (task: any) => {
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative">
      <Greeting user={user} />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex flex-col items-end">
          <button
            onClick={handleAddClick}
            disabled={!user}
            className={`px-4 py-2 rounded-md ${
              user ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            Add Task
          </button>
          {!user && <span className="text-sm text-red-400 mt-1">Please Login to Add Tasks</span>}
        </div>
      </div>

      {loading ? (
        <p className="text-center mt-10">Loading...</p>
      ) : !user ? (
        <p className="text-red-400 text-lg font-semibold text-center mt-10">Please Login</p>
      ) : (
        <TaskList tasks={tasks} onUpdate={handleUpdate} onDelete={handleDelete} />
      )}

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
