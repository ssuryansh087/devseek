"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function TaskTimeline() {
  const tasks = [
    {
      name: "Interview",
      status: "completed",
      time: "9:00 AM",
      color: "bg-red-500",
    },
    {
      name: "Ideate",
      status: "in-progress",
      time: "10:30 AM",
      color: "bg-primary",
    },
    {
      name: "Wireframe",
      status: "upcoming",
      time: "2:00 PM",
      color: "bg-blue-500",
    },
    {
      name: "Evaluate",
      status: "upcoming",
      time: "4:00 PM",
      color: "bg-purple-500",
    },
    {
      name: "Wind Down",
      status: "upcoming",
      time: "8:00 PM",
      color: "bg-cyan-500",
    },
  ];

  return (
    <Card className="elegant-shadow glass">
      <CardHeader>
        <CardTitle>Task Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {tasks.map((task, index) => (
            <div key={task.name} className="mb-4 flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className={`h-4 w-4 rounded-full ${task.color}`} />
                {index < tasks.length - 1 && (
                  <div className="h-full w-0.5 bg-primary/20" />
                )}
              </div>
              <div>
                <p className="font-medium">{task.name}</p>
                <p className="text-sm text-muted-foreground">{task.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
