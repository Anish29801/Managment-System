"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "./context/AuthContext";
import TaskForm from "./components/TaskForm";
import { TaskSection } from "./components/TaskSection";
import { Task, SubtaskDTO } from "./type";
import {
  DragDropContext,
  DropResult,
} from "@hello-pangea/dnd";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Task[]>("http://localhost:8000/tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setTasks(data);
      setFilteredTasks(data);
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err.response?.data || err.message);
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTasks();
    else {
      setTasks([]);
      setFilteredTasks([]);
    }
  }, [user]);

  // Live search (kept same)
  useEffect(() => {
    const delay = setTimeout(() => {
      if (!searchQuery.trim()) {
        setFilteredTasks(tasks);
      } else {
        const lowerQuery = searchQuery.toLowerCase();
        setFilteredTasks(
          tasks.filter((t) => {
            const subtasksMatch = Array.isArray(t.subtasks)
              ? t.subtasks.some((s) => {
                  if (typeof s === "object" && s !== null && "title" in s) {
                    return (s as SubtaskDTO).title.toLowerCase().includes(lowerQuery);
                  }
                  return false;
                })
              : false;

            return (
              t.title.toLowerCase().includes(lowerQuery) ||
              t.description?.toLowerCase().includes(lowerQuery) ||
              subtasksMatch
            );
          })
        );
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, tasks]);

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

  // ✅ Handle drag-and-drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // if same section, do nothing
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
      fetchTasks(); // refresh tasks after update
    } catch (err: any) {
      console.error("Failed to update task status:", err.response?.data || err.message);
    }
  };

  const pendingTasks = filteredTasks.filter((t) => t.status === "pending");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "inprogress");
  const completedTasks = filteredTasks.filter((t) => t.status === "completed");

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
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">{greeting}</h1>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {loading ? (
        <p className="text-center mt-10">Loading...</p>
      ) : !user ? (
        <p className="text-red-400 text-lg font-semibold text-center mt-10">
          Please Login
        </p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex flex-col md:flex-row gap-4">
            <TaskSection
              droppableId="pending"
              title="Pending"
              tasks={pendingTasks}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
            <TaskSection
              droppableId="inprogress"
              title="In Progress"
              tasks={inProgressTasks}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
            <TaskSection
              droppableId="completed"
              title="Completed"
              tasks={completedTasks}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </div>
        </DragDropContext>
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
