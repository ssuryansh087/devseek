"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowBigDown, ArrowBigUp, MessageSquare, Home } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

const posts = [
  {
    id: 1,
    community: "dev/frontend",
    title: "New React Server Components are a game changer",
    author: "reactdev123",
    upvotes: 324,
    comments: 56,
    time: "2h ago",
    content:
      "Just started using React Server Components in my latest project and the performance improvements are incredible...",
  },
  {
    id: 2,
    community: "dev/typescript",
    title: "TypeScript 5.4 Beta Released - Here's what's new",
    author: "tsexpert",
    upvotes: 245,
    comments: 43,
    time: "4h ago",
    content:
      "The TypeScript team just announced the beta release of TypeScript 5.4 with several exciting features...",
  },
  {
    id: 3,
    community: "dev/nextjs",
    title: "Building with the App Router: Best Practices",
    author: "nextjsninja",
    upvotes: 198,
    comments: 32,
    time: "6h ago",
    content:
      "After migrating several projects to the App Router, here are some best practices I've discovered...",
  },
];

const popularCommunities = [
  { name: "dev/frontend", members: 234567 },
  { name: "dev/backend", members: 198432 },
  { name: "dev/devops", members: 156789 },
  { name: "dev/mobile", members: 145678 },
  { name: "dev/ai", members: 134567 },
  { name: "dev/web3", members: 98765 },
];

const userCommunities: string[] = [];

export default function CommunitiesPage() {
  const [votes, setVotes] = useState<Record<number, number>>({});

  const handleVote = (postId: number, value: number) => {
    setVotes((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container pt-20">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-2">
            <div className="fixed w-48">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>

              <div className="mt-8">
                <h2 className="mb-4 text-lg font-semibold">Communities</h2>
                {userCommunities.length > 0 ? (
                  <div className="space-y-2">
                    {userCommunities.map((community) => (
                      <Button
                        key={community}
                        variant="ghost"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href={`/dev/${community}`}>{community}</Link>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Join a Community!
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-7">
            <div className="space-y-4">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-4 hover-lift">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleVote(post.id, 1)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ArrowBigUp className="h-6 w-6" />
                        </button>
                        <span className="text-sm font-medium">
                          {post.upvotes + (votes[post.id] || 0)}
                        </span>
                        <button
                          onClick={() => handleVote(post.id, -1)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ArrowBigDown className="h-6 w-6" />
                        </button>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Link
                            href={`/${post.community}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {post.community}
                          </Link>
                          <span>•</span>
                          <span>Posted by {post.author}</span>
                          <span>•</span>
                          <span>{post.time}</span>
                        </div>
                        <h2 className="mt-2 text-xl font-semibold">
                          {post.title}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                          {post.content}
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                            <MessageSquare className="h-4 w-4" />
                            {post.comments} Comments
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="col-span-3">
            <div className="fixed w-72">
              <Card className="p-4">
                <h2 className="mb-4 text-lg font-semibold">
                  Popular Communities
                </h2>
                <div className="space-y-2">
                  {popularCommunities.map((community) => (
                    <Link
                      key={community.name}
                      href={`/${community.name}`}
                      className="flex items-center justify-between rounded-md p-2 hover:bg-primary/5"
                    >
                      <span className="text-sm font-medium">
                        {community.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat("en-US", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(community.members)}{" "}
                        members
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
