"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Stats {
  userCount: number;
  projectCount: number;
  activeSubscriptions: number;
  mrr: number;
}

export default function AnalyticsCharts({ stats }: { stats: Stats }) {
  // بيانات الرسم البياني للمشاريع والمستخدمين
  const overviewData = [
    { name: "Users", value: stats.userCount },
    { name: "Projects", value: stats.projectCount },
    { name: "Active Subs", value: stats.activeSubscriptions },
  ];

  // بيانات MRR (يمكن تحويلها إلى رسم بياني مستقبلاً)
  const mrrData = [{ name: "MRR", amount: stats.mrr }];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-8    bg-background  text-foreground   ">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className=" p-4 rounded-lg shadow border">
          <p className="text-sm   ">Total Users</p>
          <p className="text-2xl font-bold">{stats.userCount}</p>
        </div>
        <div className=" p-4 rounded-lg shadow border   border-border">
          <p className="text-sm ">Total Projects</p>
          <p className="text-2xl font-bold">{stats.projectCount}</p>
        </div>
        <div className=" p-4 rounded-lg shadow border">
          <p className="text-sm ">Active Subscriptions</p>
          <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
        </div>
        <div className=" p-4 rounded-lg shadow border">
          <p className="text-sm ">Monthly Recurring Revenue (MRR)</p>
          <p className="text-2xl font-bold">${stats.mrr.toFixed(2)}</p>
        </div>
      </div>

      <div className=" p-4 rounded-lg shadow border   ">
        <h2 className="text-lg font-semibold mb-4 ">Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={overviewData} style={{ color: "green" }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              itemStyle={{
                color: "green",
              }}
            />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className=" p-4 rounded-lg shadow border">
        <h2 className="text-lg font-semibold mb-4">MRR (Monthly)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={mrrData}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {mrrData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
