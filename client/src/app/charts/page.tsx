"use client";

import { useEffect, useState, useMemo } from "react";
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
  TooltipProps,
} from "recharts";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Task } from "../type";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

// Map statuses directly to labels and colors
const STATUS_MAP: Record<Task["status"], { label: string; color: string }> = {
  pending: { label: "Pending", color: "#3b82f6" },
  inprogress: { label: "In Progress", color: "#60a5fa" },
  completed: { label: "Completed", color: "#93c5fd" },
};

export default function Charts() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
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

  const chartData = useMemo(() => {
    const counts: Record<Task["status"], number> = {
      pending: 0,
      inprogress: 0,
      completed: 0,
    };
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    return (Object.keys(STATUS_MAP) as Task["status"][]).map((status) => ({
      name: STATUS_MAP[status].label,
      value: counts[status],
      status,
    }));
  }, [tasks]);

  if (loading) return <p className="text-center mt-10 text-white">Loading charts...</p>;
  if (!user)
    return (
      <p className="text-red-400 text-lg font-semibold text-center mt-10">
        Please login to see charts
      </p>
    );

  /* ---------------- Custom Label for PieChart ---------------- */
  const renderPieLabel = (entry: any) => (
    <text
      x={entry.cx}
      y={entry.cy}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={14}
      fontWeight={600}
    >
      {entry.name} ({entry.value})
    </text>
  );

  /* ---------------- Custom Tooltip ---------------- */
  const CustomTooltip = ({
    active,
    payload,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 rounded text-white border-none">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

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
                label={renderPieLabel}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_MAP[entry.status].color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#ffffff" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="flex-1 p-4 rounded-2xl shadow-md" style={{ background: "#151d27" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="40%">
              <XAxis dataKey="name" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#ffffff" }} />
              <Bar dataKey="value" barSize={45}>
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_MAP[entry.status].color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
