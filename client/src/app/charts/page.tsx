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

// Map statuses directly to labels and colors
const STATUS_MAP: Record<Task["status"], { label: string; color: string }> = {
  pending: { label: "Pending", color: "#3b82f6" }, // blue
  inprogress: { label: "In Progress", color: "#60a5fa" }, // lighter blue
  completed: { label: "Completed", color: "#93c5fd" }, // lightest blue
};

export default function Charts() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chartData, setChartData] = useState<
    { name: string; value: number; status: Task["status"] }[]
  >([]);
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
    const counts: Record<Task["status"], number> = {
      pending: 0,
      inprogress: 0,
      completed: 0,
    };

    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) {
        counts[t.status]++;
      }
    });

    setChartData(
      (Object.keys(STATUS_MAP) as Task["status"][]).map((status) => ({
        name: STATUS_MAP[status].label,
        value: counts[status],
        status,
      }))
    );
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
    <section className="w-full">
      {/* Heading */}
      <div className="text-center my-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-white">
          Task Status Overview
        </h2>
        <p className="text-gray-400 mt-1">
          Visual insights of your pending, in-progress, and completed tasks
        </p>
      </div>

      {/* Charts Container */}
      <div className="flex flex-col lg:flex-row w-full h-[70vh] min-h-[400px] gap-6">
        {/* Donut Chart */}
        <div
          className="flex-1 p-4 rounded-2xl shadow-md"
          style={{ background: "#151d27" }}
        >
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
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_MAP[entry.status].color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  color: "white",
                }}
              />
              <Legend wrapperStyle={{ color: "white" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div
          className="flex-1 p-4 rounded-2xl shadow-md"
          style={{ background: "#151d27" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="40%">
              <XAxis dataKey="name" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  color: "white",
                }}
              />
              <Legend wrapperStyle={{ color: "white" }} />
              <Bar dataKey="value" barSize={45}>
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_MAP[entry.status].color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sine Wave Divider */}
      <div className="mt-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          className="w-full"
        >
          <path
            fill="#151d27"
            fillOpacity="1"
            d="M0,64L48,80C96,96,192,128,288,138.7C384,149,480,139,576,128C672,117,768,107,864,117.3C960,128,1056,160,1152,170.7C1248,181,1344,171,1392,165.3L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}
