"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Task } from "../type";

const COLORS: Record<Task["status"], string> = {
  pending: "#3b82f6",    // blue
  inprogress: "#60a5fa", // lighter blue
  completed: "#93c5fd",  // even lighter
};

export default function Charts() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chartData, setChartData] = useState([
    { name: "Pending", value: 0 },
    { name: "In Progress", value: 0 },
    { name: "Completed", value: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Task[]>("http://localhost:8000/tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Failed to fetch tasks:", err.response?.data || err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTasks();
    else setTasks([]);
  }, [user]);

  useEffect(() => {
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "inprogress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;

    setChartData([
      { name: "Pending", value: pending },
      { name: "In Progress", value: inProgress },
      { name: "Completed", value: completed },
    ]);
  }, [tasks]);

  if (loading) {
    return <p className="text-center mt-10 text-white">Loading charts...</p>;
  }

  if (!user) {
    return (
      <p className="text-red-400 text-lg font-semibold text-center mt-10">
        Please login to see charts
      </p>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full h-[70vh] min-h-[400px] gap-6">
      {/* Donut Chart */}
      <div className="flex-1 p-4 rounded-2xl shadow-md" style={{ background: "#151d27" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              label={{ fill: "white" }}
            >
              {chartData.map((entry) => {
                const key = entry.name.toLowerCase().replace(" ", "") as Task["status"];
                return <Cell key={entry.name} fill={COLORS[key]} />;
              })}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "white" }} />
            <Legend wrapperStyle={{ color: "white" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="flex-1 p-4 rounded-2xl shadow-md" style={{ background: "#151d27" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="40%">
            <XAxis dataKey="name" stroke="white" />
            <YAxis stroke="white" />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "white" }} />
            <Legend wrapperStyle={{ color: "white" }} />
            <Bar dataKey="value" barSize={45}>
              {chartData.map((entry) => {
                const key = entry.name.toLowerCase().replace(" ", "") as Task["status"];
                return <Cell key={entry.name} fill={COLORS[key]} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
