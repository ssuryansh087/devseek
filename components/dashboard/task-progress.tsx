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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const initialData = [
  { day: "Mon", completed: 65 },
  { day: "Tue", completed: 72 },
  { day: "Wed", completed: 68 },
  { day: "Thu", completed: 85 },
  { day: "Fri", completed: 78 },
  { day: "Sat", completed: 90 },
  { day: "Sun", completed: 88 },
];

export function TaskProgress() {
  const [data, setData] = useState(
    initialData.map((item) => ({ ...item, completed: 0 }))
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(initialData);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="elegant-shadow glass">
      <CardHeader>
        <CardTitle>Weekly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--primary))"
                opacity={0.1}
              />
              <XAxis dataKey="day" stroke="hsl(var(--primary))" opacity={0.5} />
              <YAxis stroke="hsl(var(--primary))" opacity={0.5} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--primary))",
                  borderRadius: "0.5rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
