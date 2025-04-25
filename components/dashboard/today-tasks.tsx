"use client";

import { MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "../ui/progress";

export function TodayTasks() {
  const tasks = [
    {
      title: "DevSeek Mobile App",
      description: "Design and develop the mobile app version of DevSeek",
      progress: 65,
      team: [
        { name: "John", image: "" },
        { name: "Sarah", image: "" },
        { name: "Mike", image: "" },
      ],
    },
    {
      title: "Community Forums",
      description: "Implement real-time chat features for developer forums",
      progress: 80,
      team: [
        { name: "Alex", image: "" },
        { name: "Emma", image: "" },
        { name: "Tom", image: "" },
      ],
    },
  ];

  return (
    <Card className="elegant-shadow glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today&apos;s Tasks</CardTitle>
        <Button variant="ghost" size="sm">
          See All
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {tasks.map((task) => (
          <div
            key={task.title}
            className="rounded-lg border border-primary/10 p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4">
              <Progress value={task.progress} className="h-2" />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex -space-x-2">
                {task.team.map((member, i) => (
                  <Avatar key={i} className="border-2 border-background">
                    <AvatarImage src={member.image} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {task.progress}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
