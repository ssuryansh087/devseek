"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  description: string;
  done: boolean;
}

interface RoadmapWeek {
  week: number;
  theme: string;
  tasks: Task[];
}

interface RoadmapCardProps {
  week: RoadmapWeek;
  onTaskToggle: (taskIndex: number) => void;
}

export function RoadmapCard({ week, onTaskToggle }: RoadmapCardProps) {
  return (
    <div className="roadmap-card-container">
      <motion.div
        whileHover={{
          scale: 1.03,
          boxShadow: "0 0 15px rgba(37, 190, 143, 0.3)",
          transition: { duration: 0.3 },
        }}
        className="roadmap-card"
      >
        <Card className="h-full border-primary/20 hover:border-primary transition-colors duration-300">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                Week {week.week}
              </span>
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {week.week <= 4
                  ? "Beginner"
                  : week.week <= 10
                  ? "Intermediate"
                  : "Advanced"}
              </span>
            </div>
            <CardTitle className="text-lg group">
              <span className="theme-text">{week.theme}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="task-content">
            <ul className="space-y-2 text-sm">
              {week.tasks.map((task, index) => (
                <li key={index} className="flex items-start gap-2 group">
                  <Checkbox
                    id={`task-${week.week}-${index}`}
                    checked={task.done}
                    onCheckedChange={() => onTaskToggle(index)}
                    className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor={`task-${week.week}-${index}`}
                    className={`flex-1 cursor-pointer group-hover:text-primary transition-colors ${
                      task.done ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.description}
                  </label>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
