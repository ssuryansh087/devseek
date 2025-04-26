/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Calendar,
  Users2,
  BookOpen,
  BarChart3,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

type Task = {
  description: string;
  done: boolean;
};

type RoadmapWeek = {
  week: number;
  theme: string;
  tasks: Task[];
};

type RoadmapData = {
  estimated_timeframe: string;
  experience_level: string;
  topic: string;
  roadmap: RoadmapWeek[];
};

export default function MyRoadmapPage() {
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  const debugData = (data: any) => {
    console.log("Roadmap data:", data);
    console.log("Roadmap type:", typeof data?.roadmap);
    console.log("Is roadmap an array:", Array.isArray(data?.roadmap));
    if (data?.roadmap && typeof data.roadmap === "object") {
      console.log("Roadmap keys:", Object.keys(data.roadmap));
    }
  };

  const safeAccess = <T extends object, K extends string>(
    obj: T | null | undefined,
    key: K
  ): any => {
    if (!obj) return undefined;
    return (obj as any)[key];
  };

  const fetchRoadmap = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        debugData(userData);

        if (userData && userData.roadmap) {
          if (
            typeof userData.roadmap === "object" &&
            safeAccess(userData.roadmap, "roadmap") &&
            Array.isArray(safeAccess(userData.roadmap, "roadmap"))
          ) {
            const roadmapObj = userData.roadmap;
            setRoadmapData({
              topic: safeAccess(roadmapObj, "topic") || "",
              estimated_timeframe:
                safeAccess(roadmapObj, "estimated_timeframe") || "",
              experience_level:
                safeAccess(roadmapObj, "experience_level") || "",
              roadmap: safeAccess(roadmapObj, "roadmap").map((week: any) => ({
                week: safeAccess(week, "week") || 0,
                theme: safeAccess(week, "theme") || "",
                tasks: Array.isArray(safeAccess(week, "tasks"))
                  ? safeAccess(week, "tasks")
                  : [],
              })),
            });
          } else {
            console.log("Unknown roadmap structure", userData.roadmap);

            const rawRoadmap = userData.roadmap;

            if (
              typeof rawRoadmap === "object" &&
              safeAccess(rawRoadmap, "topic") &&
              Array.isArray(safeAccess(rawRoadmap, "roadmap"))
            ) {
              setRoadmapData({
                topic: safeAccess(rawRoadmap, "topic"),
                estimated_timeframe:
                  safeAccess(rawRoadmap, "estimated_timeframe") || "",
                experience_level:
                  safeAccess(rawRoadmap, "experience_level") || "",
                roadmap: safeAccess(rawRoadmap, "roadmap"),
              });
            }
          }
        } else {
          console.log("No roadmap data found in user document");
        }
      } else {
        console.log("User document does not exist");
      }
    } catch (error) {
      console.error("Error fetching roadmap:", error);
      toast({
        title: "Error",
        description: "Failed to load your roadmap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [user]);

  const handleTaskToggle = async (weekIndex: number, taskIndex: number) => {
    if (!roadmapData || !user) return;

    try {
      const updatedRoadmap = JSON.parse(JSON.stringify(roadmapData));
      updatedRoadmap.roadmap[weekIndex].tasks[taskIndex].done =
        !updatedRoadmap.roadmap[weekIndex].tasks[taskIndex].done;
      setRoadmapData(updatedRoadmap);

      await updateDoc(doc(db, "users", user.uid), {
        "roadmap.roadmap": updatedRoadmap.roadmap,
      });

      toast({
        title: "Task updated",
        description: updatedRoadmap.roadmap[weekIndex].tasks[taskIndex].done
          ? "Task marked as completed"
          : "Task marked as incomplete",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateProgress = () => {
    if (!roadmapData || !roadmapData.roadmap) return 0;

    const roadmapArray = Array.isArray(roadmapData.roadmap)
      ? roadmapData.roadmap
      : [];

    let totalTasks = 0;
    let completedTasks = 0;

    roadmapArray.forEach((week) => {
      if (week && Array.isArray(week.tasks)) {
        totalTasks += week.tasks.length;
        completedTasks += week.tasks.filter((task) => task.done).length;
      }
    });

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <aside className="fixed left-0 top-0 z-30 h-full w-64 border-r border-primary/10 bg-card/80 backdrop-blur-xl">
        <nav className="p-4 mt-12">
          <p className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
            Menu
          </p>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/calendar">
                <Calendar className="h-4 w-4" />
                Calendar
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/communities">
                <Users2 className="h-4 w-4" />
                Communities
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/course-recommender">
                <BookOpen className="h-4 w-4" />
                Courses
              </Link>
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/my-roadmap">
                <BarChart3 className="h-4 w-4" />
                My Roadmap
              </Link>
            </Button>
          </div>
        </nav>
      </aside>

      <main className="pl-64">
        <div className="container py-8 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                      key={`skeleton-${i}`}
                      className="h-80 w-full rounded-lg"
                    />
                  ))}
                </div>
              </div>
            ) : roadmapData ? (
              <>
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight glow-text mb-2">
                        {roadmapData.topic
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </h2>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Timeframe:</span>
                          <span>{roadmapData.estimated_timeframe}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Experience Level:</span>
                          <span>{roadmapData.experience_level}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Progress:</span>
                          <span>{calculateProgress()}% Complete</span>
                        </div>
                      </div>
                    </div>
                    <Button className="save-button hover-lift">
                      <Save className="h-4 w-4 mr-2" />
                      Export Roadmap
                    </Button>
                  </div>

                  <div className="h-2 w-full bg-primary/10 rounded-full mb-8">
                    <div
                      className="h-2 bg-primary rounded-full transition-all duration-500 ease-in-out"
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </div>
                </div>

                {roadmapData && Array.isArray(roadmapData.roadmap) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmapData.roadmap.map((week, weekIndex) => (
                      <motion.div
                        key={`week-${week.week || weekIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: weekIndex * 0.05 }}
                      >
                        <Card className="h-full hover-lift border-primary/20 hover:border-primary transition-colors duration-300">
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
                            <ul className="space-y-3">
                              {week.tasks &&
                                Array.isArray(week.tasks) &&
                                week.tasks.map((task, taskIndex) => (
                                  <li
                                    key={`task-${week.week}-${taskIndex}`}
                                    className="flex items-start gap-2"
                                  >
                                    <Checkbox
                                      id={`task-${week.week}-${taskIndex}`}
                                      checked={task.done}
                                      onCheckedChange={() =>
                                        handleTaskToggle(weekIndex, taskIndex)
                                      }
                                      className="mt-1"
                                    />
                                    <label
                                      htmlFor={`task-${week.week}-${taskIndex}`}
                                      className={`text-sm ${
                                        task.done
                                          ? "line-through text-muted-foreground"
                                          : ""
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
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">
                      Invalid Roadmap Data
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      The roadmap data structure is not in the expected format.
                      Please generate a new roadmap.
                    </p>
                    <Button asChild>
                      <Link href="/roadmap-generator">Generate Roadmap</Link>
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">No Roadmap Found</h2>
                <p className="text-muted-foreground mb-6">
                  You don&apos;t have any saved roadmaps yet. Generate a new
                  roadmap to get started.
                </p>
                <Button asChild>
                  <Link href="/roadmap-generator">Generate Roadmap</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
