/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowBigDown,
  ArrowBigUp,
  MessageSquare,
  Home,
  Loader2, // Import Loader
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { auth, db } from "@/lib/firebase"; // Import firebase instances
import { User, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  arrayUnion,
  arrayRemove,
  getDoc,
  writeBatch,
  increment,
  orderBy, // Import orderBy
  limit, // Import limit
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { formatDistanceToNow } from "date-fns"; // Import date formatting

// Interface matching Firestore data structure
interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorEmail: string;
  community: string;
  upvotes: number;
  downvotes: number;
  upvotedBy: string[];
  downvotedBy: string[];
  createdAt: any; // Firestore Timestamp or JS Date after conversion
  commentsCount: number;
}

// Static popular communities data (could also be fetched)
const popularCommunities = [
  { name: "dev/frontend", members: 234567 },
  { name: "dev/backend", members: 198432 },
  { name: "dev/devops", members: 156789 },
  { name: "dev/mobile", members: 145678 },
  { name: "dev/ai", members: 134567 },
  { name: "dev/web3", members: 98765 },
];

// --- Communities Page Component ---
export default function CommunitiesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userCommunities, setUserCommunities] = useState<string[]>([]); // State for user's joined communities
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingUserCommunities, setIsLoadingUserCommunities] =
    useState(true);
  const [isVoting, setIsVoting] = useState<Record<string, boolean>>({}); // Track voting status per post ID (string)
  const { toast } = useToast();

  // --- Effect for Authentication and User Data ---
  useEffect(() => {
    setIsLoadingUserCommunities(true);
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // User is logged in, fetch their communities
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserCommunities(
              Array.isArray(userData.communities) ? userData.communities : []
            );
          } else {
            // User doc doesn't exist yet
            setUserCommunities([]);
          }
        } catch (error) {
          console.error("Error fetching user communities:", error);
          setUserCommunities([]); // Assume none on error
          toast({
            title: "Error",
            description: "Could not load your communities.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingUserCommunities(false);
        }
      } else {
        // User is logged out
        setUserCommunities([]);
        setIsLoadingUserCommunities(false);
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []); // Run only once on mount

  // --- Effect for Fetching Posts ---
  useEffect(() => {
    fetchPosts();
  }, []); // Fetch posts once on mount

  // --- Function to Fetch Posts ---
  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      // Query all posts, ordered by creation date, limited for performance
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(25) // Fetch latest 25 posts - IMPORTANT for performance
      );
      const querySnapshot = await getDocs(postsQuery);

      // Map posts and fetch comment counts concurrently
      const postsDataPromises = querySnapshot.docs.map(async (postDoc) => {
        const postData = postDoc.data();
        const postBase = {
          id: postDoc.id,
          title: postData.title || "",
          content: postData.content || "",
          imageUrl: postData.imageUrl || "",
          authorId: postData.authorId || "",
          authorEmail: postData.authorEmail || "Anonymous",
          community: postData.community || "",
          upvotes: postData.upvotes || 0,
          downvotes: postData.downvotes || 0,
          upvotedBy: Array.isArray(postData.upvotedBy)
            ? postData.upvotedBy
            : [],
          downvotedBy: Array.isArray(postData.downvotedBy)
            ? postData.downvotedBy
            : [],
          createdAt: postData.createdAt?.toDate() || null, // Convert Timestamp to Date
        };

        // Fetch comment count - N additional reads! Consider denormalization.
        const commentsQuery = query(
          collection(db, "comments"),
          where("postId", "==", postBase.id)
        );
        try {
          const commentsSnapshot = await getDocs(commentsQuery);
          const commentsCount = commentsSnapshot.size;
          return { ...postBase, commentsCount: commentsCount };
        } catch (countError) {
          console.error(
            `Error fetching comment count for post ${postBase.id}:`,
            countError
          );
          return { ...postBase, commentsCount: 0 }; // Default to 0 on error
        }
      });

      const postsWithCounts = await Promise.all(postsDataPromises);
      setPosts(postsWithCounts as Post[]);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts.",
        variant: "destructive",
      });
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // --- Function to Handle Voting ---
  const handleVote = async (
    postId: string,
    voteType: "upvote" | "downvote"
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote.",
        variant: "destructive",
      });
      return;
    }
    if (isVoting[postId]) return; // Prevent double clicks

    setIsVoting((prev) => ({ ...prev, [postId]: true }));

    const postRef = doc(db, "posts", postId);
    const userId = user.uid;

    try {
      const batch = writeBatch(db);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }

      // Get current data, ensuring arrays exist
      const postData = postDoc.data() as Post;
      const upvotedBy = postData.upvotedBy || [];
      const downvotedBy = postData.downvotedBy || [];
      const hasUpvoted = upvotedBy.includes(userId);
      const hasDownvoted = downvotedBy.includes(userId);

      // Determine actions based on vote type and current status
      if (voteType === "upvote") {
        if (hasUpvoted) {
          batch.update(postRef, {
            upvotes: increment(-1),
            upvotedBy: arrayRemove(userId),
          });
        } else {
          batch.update(postRef, {
            upvotes: increment(1),
            upvotedBy: arrayUnion(userId),
          });
          if (hasDownvoted) {
            // Remove downvote if switching
            batch.update(postRef, {
              downvotes: increment(-1),
              downvotedBy: arrayRemove(userId),
            });
          }
        }
      } else {
        // voteType === "downvote"
        if (hasDownvoted) {
          batch.update(postRef, {
            downvotes: increment(-1),
            downvotedBy: arrayRemove(userId),
          });
        } else {
          batch.update(postRef, {
            downvotes: increment(1),
            downvotedBy: arrayUnion(userId),
          });
          if (hasUpvoted) {
            // Remove upvote if switching
            batch.update(postRef, {
              upvotes: increment(-1),
              upvotedBy: arrayRemove(userId),
            });
          }
        }
      }

      await batch.commit();
      // Refresh posts to show updated vote counts
      // Optional: Optimistic UI update here for faster feedback
      await fetchPosts();
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to register vote.",
        variant: "destructive",
      });
      // Optional: Refetch posts even on error to ensure UI consistency
      await fetchPosts();
    } finally {
      setIsVoting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // --- Render Logic ---
  return (
    <div className="min-h-screen bg-background">
      <Navbar /> {/* Assumes Navbar handles its own auth state/display */}
      {/* // Use pt-20 or adjust based on Navbar height */}
      <div className="container mx-auto px-4 py-6 mt-16 max-w-7xl">
        {/* Main grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="hidden md:block md:col-span-2">
            {/* Use sticky positioning */}
            <div className="sticky top-20 w-full space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 p-2 rounded hover:bg-accent transition-colors"
                asChild
              >
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>

              {/* User Communities Section */}
              <div className="pt-6">
                {" "}
                {/* Add padding top */}
                <h2 className="mb-3 px-2 text-base font-semibold tracking-tight text-foreground">
                  {" "}
                  {/* Adjusted styling */}
                  My Communities
                </h2>
                {isLoadingUserCommunities ? (
                  <div className="flex justify-center p-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : user ? (
                  userCommunities.length > 0 ? (
                    <div className="space-y-1">
                      {userCommunities.map((communityName) => (
                        <Button
                          key={communityName}
                          variant="ghost"
                          // Adjust padding/height for density
                          className="w-full h-8 justify-start px-2 rounded text-sm hover:bg-accent"
                          asChild
                        >
                          {/* Correct link format */}
                          <Link
                            href={`/dev/${communityName.replace("dev/", "")}`}
                          >
                            {communityName}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-2 text-sm text-muted-foreground">
                      You haven&apos;t joined any communities yet.
                    </p>
                  )
                ) : (
                  <p className="px-2 text-sm text-muted-foreground">
                    <Link
                      href="/sign-in"
                      className="text-primary hover:underline"
                    >
                      Log in
                    </Link>{" "}
                    to see your communities.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Feed */}
          <div className="col-span-12 md:col-span-7">
            <div className="space-y-4">
              {/* Loading State for Posts */}
              {isLoadingPosts && (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {/* No Posts Message */}
              {!isLoadingPosts && posts.length === 0 && (
                <Card className="p-6 text-center text-muted-foreground">
                  No posts found. It seems quiet around here...
                </Card>
              )}

              {/* Post List */}
              {!isLoadingPosts &&
                posts.map((post) => {
                  const userVote = user
                    ? post.upvotedBy?.includes(user.uid)
                      ? "up"
                      : post.downvotedBy?.includes(user.uid)
                      ? "down"
                      : null
                    : null;
                  const voteScore = (post.upvotes || 0) - (post.downvotes || 0);

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      layout
                    >
                      {/* Use Link around Card content for better semantics */}
                      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 flex">
                        {" "}
                        {/* Flex layout */}
                        {/* Vote Controls */}
                        <div className="flex flex-col items-center gap-1 p-3 bg-muted/30 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Upvote"
                            title="Upvote"
                            onClick={() => handleVote(post.id, "upvote")}
                            disabled={isVoting[post.id] || !user}
                            className={`p-1 h-auto rounded-md ${
                              userVote === "up"
                                ? "text-primary hover:bg-primary/10"
                                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                            }`}
                          >
                            {isVoting[post.id] ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <ArrowBigUp className="h-5 w-5" />
                            )}
                          </Button>
                          <span className="text-sm font-bold select-none py-1">
                            {voteScore}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Downvote"
                            title="Downvote"
                            onClick={() => handleVote(post.id, "downvote")}
                            disabled={isVoting[post.id] || !user}
                            className={`p-1 h-auto rounded-md ${
                              userVote === "down"
                                ? "text-destructive hover:bg-destructive/10"
                                : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            }`}
                          >
                            {isVoting[post.id] ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <ArrowBigDown className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                        {/* Post Content Area */}
                        <div className="flex-1 p-4 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            {/* Link to community */}
                            <Link
                              href={`/dev/${post.community.replace(
                                "dev/",
                                ""
                              )}`} // Link to specific community page
                              className="font-semibold text-foreground hover:underline hover:text-primary transition-colors"
                              onClick={(e) => e.stopPropagation()} // Prevent card link navigation if clicking community link
                            >
                              {post.community}
                            </Link>
                            <span>•</span>
                            <span>Posted by {post.authorEmail}</span>
                            {post.createdAt && (
                              <>
                                <span>•</span>
                                <span>
                                  {formatDistanceToNow(post.createdAt, {
                                    addSuffix: true,
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                          <Link
                            href={`/dev/${post.community.replace(
                              "dev/",
                              ""
                            )}/post/${post.id}`}
                            className="block"
                          >
                            <h2 className="text-lg sm:text-xl font-semibold mb-1 break-words hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h2>
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground break-words line-clamp-3">
                            {" "}
                            {/* Line clamp for content */}
                            {post.content}
                          </p>
                          <div className="mt-3 flex items-center gap-4">
                            <Link
                              href={`/dev/${post.community.replace(
                                "dev/",
                                ""
                              )}/post/${post.id}`} // Link to post detail
                              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                              onClick={(e) => e.stopPropagation()} // Prevent outer link navigation
                            >
                              <MessageSquare className="h-4 w-4" />
                              {post.commentsCount} Comment
                              {post.commentsCount !== 1 ? "s" : ""}
                            </Link>
                            {/* Add other actions (Share, Save) here */}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden md:block md:col-span-3">
            {/* Use sticky positioning */}
            <div className="sticky top-20 w-full">
              <Card className="p-4">
                <h2 className="mb-4 text-lg font-semibold">
                  Popular Communities
                </h2>
                <div className="space-y-1">
                  {popularCommunities.map((community) => (
                    <Link
                      key={community.name}
                      href={`/dev/${community.name.replace("dev/", "")}`} // Correct link format
                      className="flex items-center justify-between rounded-md p-2 hover:bg-accent transition-colors" // Use accent color on hover
                    >
                      <span className="text-sm font-medium text-foreground">
                        {community.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {/* Compact number formatting */}
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
              {/* Add other potential right sidebar items here (Trending posts, Create community button, etc.) */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
