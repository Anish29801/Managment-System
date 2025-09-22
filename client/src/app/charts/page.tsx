"use client";

import {
<<<<<<< HEAD
  PieChart,
  Pie,
  Cell,
=======
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
>>>>>>> 3164c301c569d4ba3b13172b6cab0beef5b8a151
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
<<<<<<< HEAD
  { name: "Sales", value: 400 },
  { name: "Revenue", value: 300 },
  { name: "Customers", value: 300 },
  { name: "Expenses", value: 200 },
];

const COLORS = ["#3b82f6", "#10b981", "#facc15", "#ef4444"];

export default function ChartComponent() {
  return (
    <div className="w-full h-96 p-4 rounded-2xl shadow-md" style={{ background: "#151d27" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={{ fill: "white" }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", border: "none", color: "white" }}
          />
          <Legend
            wrapperStyle={{ color: "white" }}
          />
        </PieChart>
=======
  { month: "Jan", sales: 30, revenue: 50 },
  { month: "Feb", sales: 40, revenue: 60 },
  { month: "Mar", sales: 35, revenue: 55 },
  { month: "Apr", sales: 50, revenue: 70 },
  { month: "May", sales: 60, revenue: 90 },
];

export default function Charts() {
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
>>>>>>> 3164c301c569d4ba3b13172b6cab0beef5b8a151
      </ResponsiveContainer>
    </div>
  );
}
