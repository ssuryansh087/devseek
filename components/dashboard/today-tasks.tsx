"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { auth, db } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  Timestamp,
  updateDoc,
  arrayRemove,
  writeBatch,
} from "firebase/firestore";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type Task = {
  id: string;
  title: string;
  date: Date;
  time: string;
  userId: string;
  description?: string;
  status: "pending" | "completed";
};

export function TodayTasks() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUserTasks, setAllUserTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isProcessingTask, setIsProcessingTask] = useState<
    Record<string, boolean>
  >({});
  const { toast } = useToast();

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
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load tasks.",
          });
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
  }, [toast]);

  const todaysTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allUserTasks
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
  }, [allUserTasks]);

  const handleCompleteTask = async (
    taskId: string,
    currentStatus: "pending" | "completed"
  ) => {
    if (!currentUser) return;

    setIsProcessingTask((prev) => ({ ...prev, [taskId]: true }));
    const taskRef = doc(db, "calendar", taskId);
    const newStatus = currentStatus === "completed" ? "pending" : "completed";

    try {
      await updateDoc(taskRef, {
        status: newStatus,
      });

      setAllUserTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      toast({
        title: "Success",
        description: `Task marked as ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task status.",
      });
    } finally {
      setIsProcessingTask((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentUser) return;

    setIsProcessingTask((prev) => ({ ...prev, [taskId]: true }));
    const taskRef = doc(db, "calendar", taskId);
    const userRef = doc(db, "users", currentUser.uid);
    const batch = writeBatch(db);

    try {
      batch.delete(taskRef);
      batch.update(userRef, {
        tasks: arrayRemove(taskId),
      });

      await batch.commit();

      setAllUserTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );
      toast({
        title: "Success",
        description: "Task deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task.",
      });
    } finally {
      setIsProcessingTask((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  return (
    <Card className="shadow-lg min-h-full">
      <CardHeader>
        <CardTitle>Today&apos;s Tasks</CardTitle>
      </CardHeader>
      {/* Add fixed height and overflow-y-auto */}
      <CardContent className="grid gap-4 max-h-60 overflow-y-auto">
        {isLoadingTasks ? (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !currentUser ? (
          <p className="text-center text-muted-foreground">
            Log in to see your tasks.
          </p>
        ) : todaysTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-4 text-center">
            <p className="text-muted-foreground">No Tasks Yet</p>
            <Link href="/calendar" passHref>
              <Button
                className="bg-primary text-primary-foreground px-6 py-3 rounded-md shadow-md hover:bg-primary/90 transition-colors duration-200"
                variant="default"
              >
                Add Task
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between border-b pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center flex-1 min-w-0 mr-2 gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCompleteTask(task.id, task.status)}
                    disabled={isProcessingTask[task.id] || !currentUser}
                    className={`h-6 w-6 p-0 rounded-full ${
                      task.status === "completed"
                        ? "text-green-500 hover:text-green-600"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {isProcessingTask[task.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle
                        className={`h-4 w-4 ${
                          task.status === "completed" ? "fill-current" : ""
                        }`}
                      />
                    )}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${
                        task.status === "completed"
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.title}
                    </div>
                    {task.description && (
                      <p
                        className={`text-xs text-muted-foreground truncate ${
                          task.status === "completed" ? "line-through" : ""
                        }`}
                      >
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center flex-shrink-0 gap-2">
                  <div
                    className={`text-sm text-muted-foreground ${
                      task.status === "completed" ? "line-through" : ""
                    }`}
                  >
                    {task.time}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={isProcessingTask[task.id] || !currentUser}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    {isProcessingTask[task.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
