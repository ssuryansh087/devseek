"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Home, Users2, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { TaskProgress } from "@/components/dashboard/task-progress";
import { TaskTimeline } from "@/components/dashboard/task-timeline";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { CommunityChats } from "@/components/dashboard/community-chats";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 z-30 h-full w-64 border-r border-primary/10 bg-card/80 backdrop-blur-xl mt-16">
        <nav className="p-4">
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
              <Link href="/tasks">
                <Calendar className="h-4 w-4" />
                My Tasks
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
              <Link href="/roadmap">
                <Route className="h-4 w-4" />
                Roadmap
              </Link>
            </Button>
          </div>

          <div className="mt-8">
            <CommunityChats />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        {/* Dashboard Content */}
        <div className="p-6 mt-16">
          <div className="-mt-4 grid gap-6 lg:grid-cols-3">
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <TodayTasks />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-lg border border-primary/10 bg-card p-4 elegant-shadow glass"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Calendar</h2>
                <Button variant="ghost" size="sm">
                  February
                </Button>
              </div>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="mt-4 "
              />
            </motion.div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="h-1/2">
                <TaskProgress />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <TaskTimeline />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
