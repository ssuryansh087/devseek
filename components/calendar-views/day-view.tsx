"use client";

import { format, setHours, isSameDay } from "date-fns";
import { Check, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { doc, deleteDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  date: Date;
  time: string;
  status: "pending" | "completed";
};

export function DayView({ date, tasks }: { date: Date; tasks: Task[] }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const { toast } = useToast();
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});

  const getTasksForHour = (hour: number) => {
    return tasks.filter((task) => {
      const taskHour = Number.parseInt(task.time.split(":")[0]);
      return isSameDay(task.date, date) && taskHour === hour;
    });
  };

  const handleToggleStatus = async (
    taskId: string,
    currentStatus: "pending" | "completed"
  ) => {
    setLoadingTasks((prev) => ({ ...prev, [taskId]: true }));
    try {
      const taskRef = doc(db, "calendar", taskId);
      const newStatus = currentStatus === "pending" ? "completed" : "pending";
      await updateDoc(taskRef, {
        status: newStatus,
      });
      toast({
        title: "Success",
        description: `Task marked as ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task status",
      });
    } finally {
      setLoadingTasks((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setLoadingTasks((prev) => ({ ...prev, [taskId]: true }));
    try {
      await deleteDoc(doc(db, "calendar", taskId));

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        tasks: arrayRemove(taskId),
      });

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task",
      });
    } finally {
      setLoadingTasks((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  return (
    <div className="border border-primary/10">
      <div className="p-4 border-b border-primary/10">
        <h2 className="text-xl font-bold">
          {format(date, "EEEE, MMMM d, yyyy")}
        </h2>
      </div>
      <div className="grid grid-cols-[100px_1fr]">
        <div className="border-r border-primary/10">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-20 border-b border-primary/10 p-2 text-sm"
            >
              {format(setHours(new Date(), hour), "ha")}
            </div>
          ))}
        </div>

        <div>
          {hours.map((hour) => {
            const tasksForHour = getTasksForHour(hour);
            return (
              <div
                key={hour}
                className="h-20 border-b border-primary/10 p-2 hover:bg-primary/5 transition-colors"
              >
                {tasksForHour.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "rounded px-2 py-1 text-sm mb-1 flex items-center justify-between group",
                      task.status === "completed"
                        ? "bg-primary/5"
                        : "bg-primary/10"
                    )}
                  >
                    <span
                      className={cn(
                        "flex-1",
                        task.status === "completed" &&
                          "line-through text-muted-foreground"
                      )}
                    >
                      {task.time} - {task.title}
                    </span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {loadingTasks[task.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              handleToggleStatus(task.id, task.status)
                            }
                            className="text-green-500 hover:text-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
