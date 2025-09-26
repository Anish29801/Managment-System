"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaTasks, FaChartLine, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import TaskForm from "./components/TaskForm";
import { Task } from "./type";
import { TaskSection } from "./components/TaskSection";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import HeroSection from "./components/HeroSection";
import Card from "./components/Card";
import Clock from "./components/Clock";
import Toast from "./components/Toast"; // ✅ Toast import

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null); // ✅ Toast state

  /* ---------------- Fetch Tasks ---------------- */
  const fetchTasks = async (search?: string) => {
    if (!user) return;
    try {
      const res = await axios.get<Task[]>("http://localhost:8000/tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: search ? { search } : {},
      });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err.response?.data || err.message);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  /* ---------------- Handlers ---------------- */
  const handleAddClick = () => {
    setEditingTask(null);
    setShowForm(true);
    setToastMessage("Opening task form...");
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
      fetchTasks(searchQuery.trim());
      setToastMessage("Task deleted successfully ✅");
    } catch (err: any) {
      console.error("Failed to delete task:", err.response?.data || err.message);
      setToastMessage("❌ Failed to delete task");
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
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchTasks(searchQuery.trim());
      setToastMessage(`Task moved to ${newStatus} ✅`);
    } catch (err: any) {
      console.error("Failed to update task status:", err.response?.data || err.message);
      setToastMessage("❌ Failed to update task status");
    }
  };

  /* ---------------- Filter tasks ---------------- */
  const displayedTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pendingTasks = displayedTasks.filter((t) => t.status === "pending");
  const inProgressTasks = displayedTasks.filter((t) => t.status === "inprogress");
  const completedTasks = displayedTasks.filter((t) => t.status === "completed");

  /* ---------------- Greeting ---------------- */
  const greeting = user ? `Hi, ${user.name} Good ${getTimeOfDay()}` : "Hi, Guest";
  function getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  }

  return (
    <div
      className="min-h-screen p-6 flex flex-col relative text-white
                 bg-gradient-to-br from-gray-900 via-gray-800 to-black
                 overflow-hidden"
    >
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm pointer-events-none z-0"></div>

      <div className="relative z-10 w-full">
        {/* Hero Section only for guests */}
        {!user && <HeroSection />}

        {/* Greeting + Clock + Add/Search only for logged in */}
        {user && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 mt-6 gap-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-wide">
                {greeting}
              </h1>
              <Clock />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
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
                className={`px-6 py-2 rounded-md ${
                  user
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                Add Task
              </button>
            </div>
          </div>
        )}

        {/* Cards for guests only */}
        {!user && (
          <div className="mt-10 flex flex-col items-center gap-8">
            <div className="bg-red-900/50 border border-red-500 rounded-xl px-6 py-4 text-center shadow-lg">
              <p className="text-red-300 text-lg font-semibold">
                🚨 Please login to access your personalized task dashboard
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              <Card
                icon={<FaTasks />}
                title="Organize Tasks"
                description="Easily create, update, and manage tasks across categories."
              />
              <Card
                icon={<FaChartLine />}
                title="Track Progress"
                description="Visualize task status with drag-and-drop and progress tracking."
              />
              <Card
                icon={<FaCheckCircle />}
                title="Boost Productivity"
                description="Stay focused and achieve goals with a structured workflow."
              />
            </div>
          </div>
        )}

        {/* Tasks Sections for logged in users */}
        {user && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col md:flex-row gap-6 mt-6">
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

        {/* Task Form Modal */}
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
                onTaskAdded={() => {
                  fetchTasks(searchQuery.trim());
                  setToastMessage("✅ Task added successfully");
                }}
              />
            </div>
          </div>
        )}

        {/* ✅ Toast Notification */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            color="green"
            duration={2000}
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
    </div>
  );
}
