"use client";

import { useEffect, useState, useMemo } from "react";
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
import { auth, db } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { startOfDay, subDays, getDay } from "date-fns";

type Task = {
  id: string;
  title: string;
  date: Date;
  time: string;
  userId: string;
  description?: string;
  status: "pending" | "completed";
};

export function TaskProgress() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUserTasks, setAllUserTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  useEffect(() => {
    setIsLoadingTasks(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const taskIds = userDoc.data().tasks || [];
            const fetchedTasks: Task[] = [];

            for (const taskId of taskIds) {
              const taskDoc = await getDoc(doc(db, "calendar", taskId));
              if (taskDoc.exists()) {
                const data = taskDoc.data();
                const taskDate =
                  data.date instanceof Timestamp
                    ? data.date.toDate()
                    : new Date(data.date);

                fetchedTasks.push({
                  id: taskDoc.id,
                  title: data.title,
                  date: taskDate,
                  time: data.time,
                  userId: data.userId,
                  description: data.description,
                  status: data.status || "pending",
                } as Task);
              }
            }
            setAllUserTasks(fetchedTasks);
          } else {
            setAllUserTasks([]);
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
          setAllUserTasks([]);
        } finally {
          setIsLoadingTasks(false);
        }
      } else {
        setCurrentUser(null);
        setAllUserTasks([]);
        setIsLoadingTasks(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const weeklyProgressData = useMemo(() => {
    const completedTasks = allUserTasks.filter(
      (task) => task.status === "completed" && task.date
    );

    const today = startOfDay(new Date());
    const sevenDaysAgo = startOfDay(subDays(today, 6));

    const completedTasksLast7Days = completedTasks.filter((task) => {
      const taskDate = startOfDay(task.date);
      return taskDate >= sevenDaysAgo && taskDate <= today;
    });

    const completedCounts = new Map<string, number>();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayName = dayNames[getDay(date)];
      completedCounts.set(dayName, 0);
    }

    completedTasksLast7Days.forEach((task) => {
      const taskDayName = dayNames[getDay(task.date)];
      // Only increment if the day is one of the last 7 days initialized
      if (completedCounts.has(taskDayName)) {
        completedCounts.set(taskDayName, completedCounts.get(taskDayName)! + 1);
      }
    });

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayName = dayNames[getDay(date)];
      chartData.push({
        day: dayName,
        completed: completedCounts.get(dayName) || 0,
      });
    }

    return chartData;
  }, [allUserTasks]);

  return (
    <Card className="elegant-shadow glass">
      <CardHeader>
        <CardTitle>Weekly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingTasks ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !currentUser ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-center text-muted-foreground">
              Log in to see your progress.
            </p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyProgressData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--primary))"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--primary))"
                  opacity={0.5}
                />
                <YAxis
                  stroke="hsl(var(--primary))"
                  opacity={0.5}
                  allowDecimals={false}
                />
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
                  // Removed static animationDuration
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
