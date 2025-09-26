"use client";

import { useEffect, useState } from "react";
import { FaSearch, FaTasks, FaChartLine, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import TaskForm from "./components/TaskForm";
import { Task } from "./type";
import { TaskSection } from "./components/TaskSection";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import HeroSection from "./components/HeroSection";
import Card from "./components/Card";
import Clock from "./components/Clock";
import Toast from "./components/Toast";
import axiosInstance from "@/utils/axiosConfg";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /* ---------------- Fetch Tasks from Backend ---------------- */
  const fetchTasks = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.get<Task[]>("/tasks", {
        params: {
          search: searchQuery || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err.response?.data || err.message);
      setTasks([]);
      setToastMessage("❌ Failed to fetch tasks");
    }
  };

  /* ---------------- Trigger fetch when filters change ---------------- */
  useEffect(() => {
    fetchTasks();
  }, [user, searchQuery, startDate, endDate]);

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
      await axiosInstance.delete(`/tasks/${taskId}`);
      fetchTasks();
      setToastMessage("✅ Task deleted successfully");
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
      await axiosInstance.put(`/tasks/${draggableId}`, { status: newStatus });
      fetchTasks();
      setToastMessage(`✅ Task moved to ${newStatus}`);
    } catch (err: any) {
      console.error("Failed to update task status:", err.response?.data || err.message);
      setToastMessage("❌ Failed to update task status");
    }
  };

  /* ---------------- Task Filtering (already filtered by backend) ---------------- */
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "inprogress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  /* ---------------- Greeting ---------------- */
  const greeting = user ? `Hi, ${user.name} Good ${getTimeOfDay()}` : "Hi, Guest";
  function getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  }

  return (
    <div className="min-h-screen p-6 flex flex-col relative text-white bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm pointer-events-none z-0"></div>

      <div className="relative z-10 w-full">
        {/* Hero Section for Guests */}
        {!user && <HeroSection />}

        {/* Greeting + Clock + Add/Search for Logged In Users */}
        {user && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <h1 className="text-3xl font-bold text-white tracking-wide">{greeting}</h1>
              <Clock />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto bg-gray-800/70 p-3 rounded-xl shadow-lg">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
              </div>

              {/* Date Range */}
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  max={endDate || undefined}
                />
                <span className="text-gray-300">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={startDate || undefined}
                />
              </div>

              {/* Add Task Button */}
              <button
                onClick={handleAddClick}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-md transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        )}

        {/* Cards for Guests */}
        {!user && (
          <div className="mt-10 flex flex-col items-center gap-8">
            <div className="bg-red-900/50 border border-red-500 rounded-2xl px-6 py-5 text-center shadow-xl">
              <p className="text-red-300 text-lg font-semibold">
                🚨 Please login to access your personalized task dashboard
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              <Card icon={<FaTasks />} title="Organize Tasks" description="Easily create, update, and manage tasks across categories." />
              <Card icon={<FaChartLine />} title="Track Progress" description="Visualize task status with drag-and-drop and progress tracking." />
              <Card icon={<FaCheckCircle />} title="Boost Productivity" description="Stay focused and achieve goals with a structured workflow." />
            </div>
          </div>
        )}

        {/* Tasks Sections for Logged In Users */}
        {user && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col md:flex-row gap-6 mt-6">
              <TaskSection droppableId="pending" title="Pending" description="Tasks you need to start" tasks={pendingTasks} onUpdate={handleUpdate} onDelete={handleDelete} />
              <TaskSection droppableId="inprogress" title="In Progress" description="Tasks you are working on" tasks={inProgressTasks} onUpdate={handleUpdate} onDelete={handleDelete} />
              <TaskSection droppableId="completed" title="Completed" description="Tasks you have finished" tasks={completedTasks} onUpdate={handleUpdate} onDelete={handleDelete} />
            </div>
          </DragDropContext>
        )}

        {/* Task Form Modal */}
        {showForm && user && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
            <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <TaskForm
                user={user}
                task={editingTask}
                onClose={() => setShowForm(false)}
                onTaskAdded={() => {
                  fetchTasks();
                  setToastMessage("✅ Task added successfully");
                }}
              />
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <Toast message={toastMessage} color="green" duration={2000} onClose={() => setToastMessage(null)} />
        )}
      </div>
    </div>
  );
}
