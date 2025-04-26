"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Star, Clock, BookOpen, IndianRupee } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import Image from "next/image";
import udemyicon from "@/public/assets/udemy-icon.png";

interface Course {
  id: number;
  title: string;
  instructor_name: string;
  headline: string;
  avg_rating: number;
  num_reviews: number;
  content_length_min: number;
  language: string;
  is_paid: boolean;
  course_url: string;
}

type SortOption = "relevance" | "rating" | "newest";

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Korean",
  "Hindi",
  "Arabic",
  "Russian",
];

export default function CourseRecommenderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [showOnlyFree, setShowOnlyFree] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [courses, setCourses] = useState<Course[]>([]);
  const [sortedCourses, setSortedCourses] = useState<Course[]>([]);

  const requestBody = {
    query: searchQuery || "React",
    language: selectedLanguage === "All" ? "en" : selectedLanguage || "English",
    top_n: 9,
  };

  const recEngine = async () => {
    try {
      const response = await fetch("http://localhost:5000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        setCourses([]);
      } else {
        const recommendations = (await response.json()) as Course[];
        console.log(recommendations);
        setCourses(recommendations);
      }
    } catch (error) {
      console.error("Network Error:", error);
      setCourses([]);
    }
  };

  const handleSearch = () => {
    setSearchPerformed(true);
    recEngine();
  };

  useEffect(() => {
    let filteredCourses = [...courses];

    if (showOnlyFree) {
      filteredCourses = filteredCourses.filter((course) => !course.is_paid);
    }

    if (selectedLanguage !== "All") {
      filteredCourses = filteredCourses.filter(
        (course) => course.language === selectedLanguage
      );
    }

    const sorted = sortCourses(filteredCourses, sortOption);
    setSortedCourses(sorted);
  }, [courses, showOnlyFree, sortOption, selectedLanguage]);

  const sortCourses = (
    coursesToSort: Course[],
    option: SortOption
  ): Course[] => {
    const coursesCopy = [...coursesToSort];

    switch (option) {
      case "relevance":
        return coursesToSort;
      case "rating":
        return coursesCopy.sort((a, b) => b.avg_rating - a.avg_rating);
      case "newest":
        return coursesCopy.sort((a, b) => {
          return b.id - a.id;
        });
      default:
        return coursesCopy;
    }
  };

  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container py-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight glow-text mb-4">
              Course Recommender
            </h1>
            <h1 className="text-xl font-bold tracking-tight glow-text mb-4 flex items-center justify-center">
              - in Collaboration with Udemy
              <Image src={udemyicon} alt="Udemy Icon" className="w-10 ml-2" />
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect course to boost your skills. Enter what you want
              to learn, select your preferred language, and choose between free
              and paid options.
            </p>
          </div>
          <Card className="max-w-3xl mx-auto mb-12 elegant-shadow">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="search">What do you want to learn?</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="e.g. React, Python, Machine Learning..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={selectedLanguage}
                      onValueChange={setSelectedLanguage}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Languages</SelectItem>
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricing">Filter Price</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="pricing"
                        checked={showOnlyFree}
                        onCheckedChange={setShowOnlyFree}
                      />
                      <Label htmlFor="pricing" className="cursor-pointer">
                        {showOnlyFree
                          ? "Free Courses Only"
                          : "Show All Courses"}
                      </Label>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full hover-lift glow"
                  onClick={handleSearch}
                >
                  Find Courses
                </Button>
              </div>
            </CardContent>
          </Card>
          {searchPerformed && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {sortedCourses.length}{" "}
                  {sortedCourses.length === 1 ? "Course" : "Courses"}{" "}
                  Recommended
                </h2>
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <Card className="flex flex-col h-full hover-lift">
                      <CardHeader>
                        <CardTitle className="line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <span>{course.instructor_name}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {course.headline}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{course.avg_rating.toFixed(2)}</span>
                            <span className="text-muted-foreground">
                              ({course.num_reviews.toLocaleString()})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>
                              ~ {Math.floor(course.content_length_min / 60)}{" "}
                              Hours
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span>{course.language}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-4 w-4 text-primary" />
                            <span>{course.is_paid ? "Paid" : "Free"}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="mt-auto">
                        <Link
                          href={`https://www.udemy.com${course.course_url}`}
                          target="_blank"
                          className="w-full"
                        >
                          <Button className="w-full">View Course</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
