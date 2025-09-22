"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", sales: 30, revenue: 50 },
  { month: "Feb", sales: 40, revenue: 60 },
  { month: "Mar", sales: 35, revenue: 55 },
  { month: "Apr", sales: 50, revenue: 70 },
  { month: "May", sales: 60, revenue: 90 },
];

export default function ChartComponent() {
  return (
    <div className="w-full h-96 p-4 bg-white rounded-2xl shadow-md">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
          <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
