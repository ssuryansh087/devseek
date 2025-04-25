/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Save } from "lucide-react";
import Link from "next/link";
import { RoadmapCard } from "@/components/roadmap/roadmap-card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Task {
  description: string;
  done: boolean;
}

interface RoadmapWeek {
  week: number;
  theme: string;
  tasks: Task[];
}

interface RoadmapResponse {
  estimated_timeframe: string;
  experience_level: string;
  roadmap: RoadmapWeek[];
  topic: string;
}

export default function RoadmapGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapResponse | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerateRoadmap = async () => {
    if (!topic) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a topic",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        "http://localhost:5000/generate-topic-roadmap",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic_phrase: topic.toLowerCase(),
            timeframe: timeframe || "16 weeks",
            experience_level: experienceLevel || "Some programming experience",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to generate roadmap");
      }

      const data: RoadmapResponse = await response.json();
      setRoadmapData(data);
      setShowRoadmap(true);
    } catch (error) {
      console.error("Error generating roadmap:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate roadmap. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRoadmap = async () => {
    try {
      setIsSaving(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please sign in to save your roadmap",
        });
        router.push("/login");
        return;
      }

      if (!roadmapData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No roadmap to save",
        });
        return;
      }

      await updateDoc(doc(db, "users", currentUser.uid), {
        roadmap: roadmapData,
      });

      toast({
        title: "Success!",
        description: "Roadmap saved successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save roadmap",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTaskToggle = (weekIndex: number, taskIndex: number) => {
    if (!roadmapData) return;

    const updatedRoadmap = { ...roadmapData };
    const task = updatedRoadmap.roadmap[weekIndex].tasks[taskIndex];
    task.done = !task.done;
    setRoadmapData(updatedRoadmap);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container py-12 mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight glow-text mb-4">
              Roadmap Generator
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create a personalized learning roadmap by entering what you want
              to learn, your timeframe, and your current experience level.
            </p>
          </div>

          <Card className="mb-12 elegant-shadow">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="topic">What do you want to learn?</Label>
                  <Input
                    id="topic"
                    placeholder="e.g. Learn Rust Programming"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Input
                    id="timeframe"
                    placeholder="e.g. 4 Months"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select
                    value={experienceLevel}
                    onValueChange={setExperienceLevel}
                  >
                    <SelectTrigger id="experience">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No programming experience">
                        No programming experience
                      </SelectItem>
                      <SelectItem value="Some programming experience">
                        Some programming experience
                      </SelectItem>
                      <SelectItem value="Experienced programmer">
                        Experienced programmer
                      </SelectItem>
                      <SelectItem value="Professional developer">
                        Professional developer
                      </SelectItem>
                      <SelectItem value="Expert in related field">
                        Expert in related field
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  className="roadmap-generate-button hover-lift"
                  onClick={handleGenerateRoadmap}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-pulse">
                        Generating Roadmap...
                      </span>
                    </>
                  ) : (
                    "Generate Roadmap"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {showRoadmap && roadmapData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Your Learning Roadmap: {roadmapData.topic}
                </h2>
                <Button
                  className="save-button hover-lift"
                  onClick={handleSaveRoadmap}
                  disabled={isSaving}
                >
                  <Save
                    className={`h-4 w-4 mr-2 ${
                      isSaving ? "animate-pulse" : ""
                    }`}
                  />
                  <span className={isSaving ? "animate-pulse" : ""}>
                    {isSaving ? "Saving..." : "Save Roadmap"}
                  </span>
                </Button>
              </div>

              <div className="roadmap-container">
                {roadmapData.roadmap.map((week, weekIndex) => (
                  <RoadmapCard
                    key={week.week}
                    week={week}
                    onTaskToggle={(taskIndex) =>
                      handleTaskToggle(weekIndex, taskIndex)
                    }
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
