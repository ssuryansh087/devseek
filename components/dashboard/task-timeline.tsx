"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { auth, db } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";

type Task = {
  id: string;
  title: string;
  date: Date;
  time: string;
  userId: string;
  description?: string;
  status: "pending" | "completed";
};

export function TaskTimeline() {
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

  const todaysTimelineTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredTasks = allUserTasks
      .filter((task) => {
        if (!task.date) return false;
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      })
      .sort((a, b) => {
        if (!a.time || !b.time) return 0;
        return a.time.localeCompare(b.time);
      });

    return filteredTasks.map((task) => ({
      id: task.id, // Include id for keys
      name: task.title,
      status: task.status, // Use the fetched status
      time: task.time,
      // Assign color based on status
      color: task.status === "completed" ? "bg-green-500" : "bg-primary",
    }));
  }, [allUserTasks]);

  return (
    <Card className="elegant-shadow glass min-h-full">
      <CardHeader>
        <CardTitle>Task Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingTasks ? (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !currentUser ? (
          <p className="text-center text-muted-foreground">
            Log in to see your timeline.
          </p>
        ) : todaysTimelineTasks.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No tasks for today.
          </p>
        ) : (
          <div className="relative">
            {todaysTimelineTasks.map((task, index) => (
              <div
                key={task.id}
                className="mb-4 flex items-center gap-4 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`h-4 w-4 rounded-full ${task.color} shrink-0`}
                  />
                  {index < todaysTimelineTasks.length - 1 && (
                    <div className="h-full w-0.5 bg-primary/20 grow" />
                  )}
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      task.status === "completed"
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {task.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{task.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
