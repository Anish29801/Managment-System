"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import TaskForm from "./components/TaskForm";
import { useAuth } from "./context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

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
    if (!user) return;
    setEditingTask(null);
    setShowAddForm(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!user) return;
    try {
      await axios.delete(`http://localhost:8000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchTasks(); // refresh tasks
    } catch (err: any) {
      console.error("Failed to delete task:", err.response?.data || err.message);
    }
  };

  const handleUpdate = (task: any) => {
    setEditingTask(task);
    setShowAddForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative">
      {/* Header */}
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
          {!user && (
            <span className="text-sm text-red-400 mt-1">
              Please Login to Add Tasks
            </span>
          )}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <p className="text-center mt-10">Loading...</p>
      ) : !user ? (
        <p className="text-red-400 text-lg font-semibold text-center mt-10">
          Please Login
        </p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">No tasks yet.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="bg-gray-800 p-4 rounded-md flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{task.title}</h2>
                <p className="text-gray-400">{task.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(task)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Task Form Modal */}
      {showAddForm && user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md">
            <TaskForm
              user={user}
              task={editingTask}       // pass editing task to form
              onClose={() => setShowAddForm(false)}
              onTaskAdded={fetchTasks} // refresh tasks after add/update
            />
          </div>
        </div>
      )}
    </div>
  );
}
