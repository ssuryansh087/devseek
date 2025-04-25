"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart,
  FileText,
  Users,
  Code,
  BookOpen,
  BarChart3,
  FileUp,
} from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";
import { ProgressChart } from "@/components/progress-chart";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function Home() {
  const [user, loading] = useAuthState(auth);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <SignedInLandingPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container pt-24">
        <section className="py-24 md:py-32">
          <motion.div
            className="text-center space-y-4"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter glow-text">
              Accelerate Your Developer Career
            </h1>
            <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
              Join a community of developers, track your progress, and build
              your professional profile with DevSeek.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="hover-lift bg-primary hover:bg-primary/90 glow"
                asChild
              >
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="hover-lift border-primary/20 hover:bg-primary/10"
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="group relative rounded-lg border border-primary/20 p-6 hover-lift bg-card elegant-shadow">
              <FileText className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2 glow-text">
                Resume Analysis
              </h3>
              <p className="text-sm text-muted-foreground">
                Get expert insights and recommendations to improve your resume.
              </p>
            </div>
            <div className="group relative rounded-lg border border-primary/20 p-6 hover-lift bg-card elegant-shadow">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2 glow-text">
                Community Forums
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect with developers in your domain through specialized
                groups.
              </p>
            </div>
            <div className="group relative rounded-lg border border-primary/20 p-6 hover-lift bg-card elegant-shadow">
              <BarChart className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2 glow-text">
                Progress Tracking
              </h3>
              <p className="text-sm text-muted-foreground">
                Set and track your goals with daily, weekly, and monthly to-do
                lists.
              </p>
            </div>
            <div className="group relative rounded-lg border border-primary/20 p-6 hover-lift bg-card elegant-shadow">
              <Award className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2 glow-text">
                Achievement Badges
              </h3>
              <p className="text-sm text-muted-foreground">
                Earn badges and showcase your accomplishments as you progress.
              </p>
            </div>
          </motion.div>
        </section>

        <motion.section
          className="py-24 md:py-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Build Your Professional Profile
              </h2>
              <p className="text-muted-foreground">
                Create a comprehensive developer profile that showcases your
                skills, projects, and achievements. Stand out to potential
                employers and connect with other professionals.
              </p>
              <Button size="lg" className="mt-4" asChild>
                <Link href="/signup">Create Profile</Link>
              </Button>
            </div>
            <div className="rounded-lg border bg-muted aspect-square" />
          </div>
        </motion.section>

        <motion.section
          className="py-24 md:py-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="container space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl glow-text">
                Success Stories
              </h2>
              <p className="text-muted-foreground max-w-[600px] mx-auto">
                See how developers are transforming their careers with DevSeek
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <motion.div
                className="lg:col-span-2 rounded-lg border border-primary/20 p-6 bg-card hover-lift elegant-shadow glass"
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex -space-x-4 mb-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full border-2 border-background bg-muted"
                    />
                  ))}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Join Thousands of Successful Developers
                </h3>
                <p className="text-muted-foreground">
                  Our platform has helped developers worldwide to enhance their
                  skills, build stronger profiles, and land their dream jobs.
                  Join our community and take your career to new heights.
                </p>
              </motion.div>

              <motion.div
                className="rounded-lg border border-primary/20 p-6 bg-card hover-lift elegant-shadow glass"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="mb-4">
                  <Code className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2 font-mono text-sm">
                  <div className="text-muted-foreground">
                    {"const career = {"}
                  </div>
                  <div className="pl-4">
                    <span className="text-primary">skills:</span> [<br />
                    <span className="pl-4">&quot;React&quot;,</span>
                    <br />
                    <span className="pl-4">&quot;Node.js&quot;,</span>
                    <br />
                    <span className="pl-4">&quot;TypeScript&quot;</span>
                    <br />
                    ],
                  </div>
                  <div className="pl-4">
                    <span className="text-primary">level:</span>{" "}
                    &quot;Expert&quot;
                  </div>
                  <div>{"}"}</div>
                </div>
              </motion.div>

              <motion.div
                className="lg:col-span-3 hover-lift"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="border border-primary/20 rounded-lg bg-card elegant-shadow glass">
                  <ProgressChart />
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
              <motion.div
                className="text-center p-6 rounded-lg border border-primary/20 bg-card hover-lift elegant-shadow glass"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold mb-2 glow-text">
                  <AnimatedNumber value={50000} />+
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Developers
                </div>
              </motion.div>
              <motion.div
                className="text-center p-6 rounded-lg border border-primary/20 bg-card hover-lift elegant-shadow glass"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold mb-2 glow-text">
                  <AnimatedNumber value={85} />%
                </div>
                <div className="text-sm text-muted-foreground">
                  Career Growth
                </div>
              </motion.div>
              <motion.div
                className="text-center p-6 rounded-lg border border-primary/20 bg-card hover-lift elegant-shadow glass"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold mb-2 glow-text">
                  <AnimatedNumber value={1000} />+
                </div>
                <div className="text-sm text-muted-foreground">
                  Companies Hiring
                </div>
              </motion.div>
              <motion.div
                className="text-center p-6 rounded-lg border border-primary/20 bg-card hover-lift elegant-shadow glass"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold mb-2 glow-text">24/7</div>
                <div className="text-sm text-muted-foreground">
                  Community Support
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="py-24 md:py-32 rounded-lg px-4 border border-primary/20 bg-card elegant-shadow glass"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="container text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl glow-text">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto">
              Join thousands of developers who are accelerating their careers
              with DevSeek.
            </p>
            <Button
              size="lg"
              className="mt-4 hover-lift bg-primary hover:bg-primary/90 glow"
              asChild
            >
              <Link href="/signup">
                Sign Up Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}

function SignedInLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container pt-24">
        <section className="py-12 md:py-20">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter glow-text">
              Welcome to DevSeek
            </h1>
            <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
              Your all-in-one platform to accelerate your developer career.
              Explore our tools and resources designed to help you grow.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col h-full"
            >
              <div className="group relative rounded-lg border border-primary/20 p-6 hover-lift bg-card elegant-shadow h-full flex flex-col">
                <div className="mb-6 relative h-48 w-full overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm opacity-100 transition-opacity flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2 glow-text">
                  Course Recommender
                </h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Find the perfect courses to boost your skills. Our AI-powered
                  recommender analyzes your profile and suggests courses
                  tailored to your career goals.
                </p>
                <Button className="w-full hover-lift glow" asChild>
                  <Link href="/course-recommender">
                    Explore Courses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="group relative rounded-lg border border-primary/20 p-6 hover-lift bg-card elegant-shadow h-full flex flex-col">
                <div className="mb-6 relative h-48 w-full overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm opacity-100 transition-opacity flex items-center justify-center">
                    <BarChart3 className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2 glow-text">
                  Roadmap Generator
                </h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Create personalized learning roadmaps for any technology or
                  skill. Break down your learning journey into manageable steps
                  with clear milestones.
                </p>
                <Button className="w-full hover-lift glow" asChild>
                  <Link href="/roadmap-generator">
                    Generate Roadmap
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col h-full"
            >
              <div className="group relative rounded-lg border border-primary/20 p-6 hover-lift bg-card elegant-shadow h-full flex flex-col">
                <div className="mb-6 relative h-48 w-full overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm opacity-100 transition-opacity flex items-center justify-center">
                    <FileUp className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2 glow-text">
                  Resume Analyzer & Builder
                </h3>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Get expert insights on your resume and build a standout CV.
                  Our AI analyzes your resume against industry standards and
                  provides actionable improvements.
                </p>
                <Button className="w-full hover-lift glow" asChild>
                  <Link href="/resume-analyzer">
                    Analyze Resume
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid gap-12 md:grid-cols-2 items-center"
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl glow-text">
                Track Your Progress
              </h2>
              <p className="text-muted-foreground">
                Monitor your learning journey with our comprehensive tracking
                tools. Set goals, track completions, and visualize your growth
                over time.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-1">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <span>
                    Earn badges and certificates as you complete milestones
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-1">
                    <BarChart className="h-4 w-4 text-primary" />
                  </div>
                  <span>
                    Visualize your progress with interactive charts and graphs
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-1">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span>Compare your progress with peers in your field</span>
                </li>
              </ul>
              <Button className="hover-lift" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="rounded-lg border border-primary/20 p-6 bg-card elegant-shadow glass">
              <ProgressChart />
            </div>
          </motion.div>
        </section>

        <motion.section
          className="py-12 md:py-20 rounded-lg px-6 border border-primary/20 bg-card elegant-shadow glass mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl glow-text">
              Join Our Developer Community
            </h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto">
              Connect with like-minded developers, share knowledge, and grow
              together. Our community forums are the perfect place to ask
              questions and share your expertise.
            </p>
            <Button size="lg" className="hover-lift glow" asChild>
              <Link href="/communities">
                Explore Communities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
