"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import TaskForm from "./components/TaskForm";
import { Task } from "./type";
import { TaskSection } from "./components/TaskSection";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* ---------------- Fetch Tasks from backend ---------------- */
  const fetchTasks = async (search?: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get<Task[]>("http://localhost:8000/tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: search ? { search } : {},
      });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err.response?.data || err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Initial fetch ---------------- */
  useEffect(() => {
    fetchTasks();
  }, [user]);

  /* ---------------- Handlers ---------------- */
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
      fetchTasks(searchQuery.trim()); // refresh with current search
    } catch (err: any) {
      console.error("Failed to delete task:", err.response?.data || err.message);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const newStatus =
      destination.droppableId === "pending"
        ? "pending"
        : destination.droppableId === "inprogress"
        ? "inprogress"
        : "completed";

    try {
      await axios.put(
        `http://localhost:8000/tasks/${draggableId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchTasks(searchQuery.trim()); // refresh with current search
    } catch (err: any) {
      console.error("Failed to update task status:", err.response?.data || err.message);
    }
  };

  /* ---------------- Local search filtering for instant UI ---------------- */
  const displayedTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingTasks = displayedTasks.filter((t) => t.status === "pending");
  const inProgressTasks = displayedTasks.filter((t) => t.status === "inprogress");
  const completedTasks = displayedTasks.filter((t) => t.status === "completed");

  /* ---------------- Greeting ---------------- */
  const greeting = user
    ? `Hi, ${user.name} Good ${getTimeOfDay()}`
    : "Hi, Guest";

  function getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  }

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen p-6 flex flex-col relative text-white
                    bg-gradient-to-br from-gray-900 via-gray-800 to-black
                    overflow-hidden">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm pointer-events-none z-0"></div>

      <div className="relative z-10 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              📝
            </div>
            <h1 className="text-3xl font-bold text-white tracking-wide">TaskMaster</h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-800/80 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>

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
        </div>

        <p className="text-gray-300 text-sm mb-6">
          Organize your day. Stay productive. Manage tasks effortlessly with{" "}
          <span className="text-blue-400 font-semibold">TaskMaster</span>.
        </p>

        {loading ? (
          <p className="text-center mt-10">Loading...</p>
        ) : !user ? (
          <p className="text-red-400 text-lg font-semibold text-center mt-10">
            Please Login
          </p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col md:flex-row gap-6">
              <TaskSection
                droppableId="pending"
                title="Pending"
                description="Tasks you need to start"
                tasks={pendingTasks}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
              <TaskSection
                droppableId="inprogress"
                title="In Progress"
                description="Tasks you are working on"
                tasks={inProgressTasks}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
              <TaskSection
                droppableId="completed"
                title="Completed"
                description="Tasks you have finished"
                tasks={completedTasks}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </div>
          </DragDropContext>
        )}

        {showForm && user && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowForm(false)}
          >
            <div
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <TaskForm
                user={user}
                task={editingTask}
                onClose={() => setShowForm(false)}
                onTaskAdded={() => fetchTasks(searchQuery.trim())} // refresh backend
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
