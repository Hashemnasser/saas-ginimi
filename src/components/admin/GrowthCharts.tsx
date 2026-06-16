"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface GrowthDataPoint {
  month: string;
  newUsers: number;
  newProjects: number;
  newSubscriptions: number;
}

export default function GrowthCharts({ data }: { data: GrowthDataPoint[] }) {
  return (
    <div className="bg-background p-4 rounded-lg shadow border">
      <h2 className="text-lg font-semibold mb-4">Growth Over Last 12 Months</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            interval={0} // أضف هذا السطر لإجبار ظهور كل الشهور
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="newUsers"
            stroke="#3b82f6"
            name="New Users"
          />
          <Line
            type="monotone"
            dataKey="newProjects"
            stroke="#10b981"
            name="New Projects"
          />
          <Line
            type="monotone"
            dataKey="newSubscriptions"
            stroke="#f59e0b"
            name="New Subscriptions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
