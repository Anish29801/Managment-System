"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
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
      </ResponsiveContainer>
    </div>
  );
}
