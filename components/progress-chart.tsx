"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../components/ui/card";

const initialData = [
  { month: "Jan", value: 30 },
  { month: "Feb", value: 40 },
  { month: "Mar", value: 45 },
  { month: "Apr", value: 60 },
  { month: "May", value: 65 },
  { month: "Jun", value: 85 },
];

export function ProgressChart() {
  const [data, setData] = useState(
    initialData.map((item) => ({ ...item, value: 0 }))
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(initialData);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="p-6 h-full">
      <h3 className="text-lg font-bold mb-4">Developer Progress</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
