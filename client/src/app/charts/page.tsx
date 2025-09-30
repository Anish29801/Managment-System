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
  PieLabelRenderProps,
} from "recharts";
import axiosInstance from "@/utils/axiosConfg";
import { useAuth } from "../context/AuthContext";
import { Task, ChartPayload } from "../type";

// Status map with label & color
const STATUS_MAP: Record<Task["status"], { label: string; color: string }> = {
  pending: { label: "Pending", color: "#3b82f6" },
  inprogress: { label: "In Progress", color: "#60a5fa" },
  completed: { label: "Completed", color: "#93c5fd" },
};

type FilterType = "all" | "3months" | "1month";

export default function Charts() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("3months"); // Default: Last 3 months

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<Task[]>("/tasks");
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

  // Apply filter safely
  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    const now = new Date();
    const cutoff =
      filter === "3months"
        ? new Date(new Date().setMonth(now.getMonth() - 3))
        : new Date(new Date().setMonth(now.getMonth() - 1));

    return tasks.filter((t) => {
      if (!t.createdAt) return false; // guard against undefined
      return new Date(t.createdAt) >= cutoff;
    });
  }, [tasks, filter]);

  const chartData = useMemo(() => {
    const counts: Record<Task["status"], number> = {
      pending: 0,
      inprogress: 0,
      completed: 0,
    };
    filteredTasks.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    return (Object.keys(STATUS_MAP) as Task["status"][]).map((status) => ({
      name: STATUS_MAP[status].label,
      value: counts[status],
      status,
    }));
  }, [filteredTasks]);

  if (loading)
    return <p className="text-center mt-20 text-white text-lg">Loading charts...</p>;

  if (!user)
    return (
      <p className="text-red-400 text-lg font-semibold text-center mt-20">
        Please login to see charts
      </p>
    );

  // ---------------- Custom Tooltip ----------------
  const CustomTooltip = ({
    active,
    payload,
  }: TooltipProps<number, string> & { payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartPayload;
      return (
        <div className="bg-gray-900 p-3 rounded-lg shadow-lg text-white border-none">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-sm">{data.value}</p>
        </div>
      );
    }
    return null;
  };

  // ---------------- Donut Center Label ----------------
  const renderCenterLabel = (props: PieLabelRenderProps) => {
    const { cx, cy } = props;
    if (cx == null || cy == null) return null;
    const total = chartData.reduce((sum, entry) => sum + entry.value, 0);
    return (
      <text
        x={Number(cx)}
        y={Number(cy)}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={16}
        fontWeight={700}
      >
        {`Total: ${total}`}
      </text>
    );
  };

  return (
    <section className="w-full px-4 lg:px-12 py-8">
      {/* Heading */}
      <div className="text-center mb-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-white">
          Task Status Overview
        </h2>
        <p className="text-gray-400 mt-2 text-base lg:text-lg">
          Visual insights of your pending, in-progress, and completed tasks
        </p>
      </div>

      {/* Filter Dropdown */}
      <div className="flex justify-center mb-8">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="px-4 py-2 rounded-xl bg-[#1e293b] text-gray-200 font-medium border border-gray-600 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="all">Full Dataset</option>
          <option value="3months">Last 3 Months</option>
          <option value="1month">Last Month</option>
        </select>
      </div>

      {/* Charts Container */}
      <div className="flex flex-col lg:flex-row gap-6 w-full h-[70vh] min-h-[450px]">
        {/* Donut Chart */}
        <div className="flex-1 bg-[#151d27] rounded-3xl p-6 shadow-xl flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart key={filter}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="70%"
                labelLine={false}
                label={renderCenterLabel}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_MAP[entry.status].color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: "#ffffff" }}
                iconSize={12}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="flex-1 bg-[#151d27] rounded-3xl p-6 shadow-xl flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="30%" key={filter}>
              <XAxis dataKey="name" stroke="#ffffff" tick={{ fontSize: 14 }} />
              <YAxis stroke="#ffffff" tick={{ fontSize: 14 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: "#ffffff" }}
                iconSize={12}
                layout="horizontal"
                verticalAlign="top"
                align="center"
              />
              <Bar
                dataKey="value"
                barSize={50}
                radius={[5, 5, 0, 0]}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
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
