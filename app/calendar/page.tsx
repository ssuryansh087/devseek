"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { MonthView } from "@/components/calendar-views/month-view";
import { WeekView } from "@/components/calendar-views/week-view";
import { DayView } from "@/components/calendar-views/day-view";
import { YearView } from "@/components/calendar-views/year-view";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { Navbar } from "@/components/navbar";

type ViewType = "month" | "day" | "week" | "year";
type Task = {
  id: string;
  title: string;
  date: Date;
  time: string;
  userId: string;
  description?: string;
  status: "pending" | "completed";
};

export default function CalendarPage() {
  const [view, setView] = useState<ViewType>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    date: new Date(),
    time: "12:00",
    description: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsFetching(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          setIsFetching(false);
          return;
        }

        const taskIds = userDoc.data().tasks || [];
        const fetchedTasks: Task[] = [];

        for (const taskId of taskIds) {
          const taskDoc = await getDoc(doc(db, "calendar", taskId));
          if (taskDoc.exists()) {
            const data = taskDoc.data();
            fetchedTasks.push({
              id: taskDoc.id,
              title: data.title,
              date: data.date.toDate(),
              time: data.time,
              userId: data.userId,
              description: data.description,
              status: data.status,
            } as Task);
          }
        }

        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load tasks",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchTasks();
  }, [toast]);

  const handleAddTask = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to add tasks",
      });
      router.push("/signin");
      return;
    }

    if (!newTask.title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Task title is required",
      });
      return;
    }

    setIsLoading(true);
    try {
      const taskData = {
        title: newTask.title.trim(),
        date: Timestamp.fromDate(newTask.date),
        time: newTask.time,
        description: newTask.description.trim(),
        userId: user.uid,
        status: "pending",
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "calendar"), taskData);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        tasks: arrayUnion(docRef.id),
      });

      const newTaskWithId: Task = {
        id: docRef.id,
        title: newTask.title,
        date: newTask.date,
        time: newTask.time,
        userId: user.uid,
        description: newTask.description,
        status: "pending",
      };

      setTasks([...tasks, newTaskWithId]);
      setNewTask({
        title: "",
        date: new Date(),
        time: "12:00",
        description: "",
      });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Task added successfully",
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add task",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthYear = () => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(date);
    switch (view) {
      case "month":
        newDate.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(date.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "day":
        newDate.setDate(date.getDate() + (direction === "next" ? 1 : -1));
        break;
      case "year":
        newDate.setFullYear(
          date.getFullYear() + (direction === "next" ? 1 : -1)
        );
        break;
    }
    setDate(newDate);
  };

  const handleOpenWeek = (view: string, date: Date) => {
    setDate(date as Date);
    setTimeout(() => setView(view as ViewType), 200);
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container pt-24">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Calendar</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Input
                      placeholder="Task Name"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Description (optional)"
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Calendar
                      mode="single"
                      selected={newTask.date}
                      onSelect={(date) =>
                        date && setNewTask({ ...newTask, date })
                      }
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <Input
                      type="time"
                      value={newTask.time}
                      onChange={(e) =>
                        setNewTask({ ...newTask, time: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddTask} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Task"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={view}
              onValueChange={(value: ViewType) => setView(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[150px] text-center font-medium">
                {getMonthYear()}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border border-primary/10 bg-card"
        >
          {view === "month" && (
            <MonthView date={date} tasks={tasks} openDay={handleOpenWeek} />
          )}
          {view === "week" && <WeekView date={date} tasks={tasks} />}
          {view === "day" && <DayView date={date} tasks={tasks} />}
          {view === "year" && <YearView date={date} />}
        </motion.div>
      </main>
    </div>
  );
}
