/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, ChangeEvent, use, Usable } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowBigDown,
  ArrowBigUp,
  MessageSquare,
  Home,
  Users,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  getDoc,
  writeBatch,
  increment,
  serverTimestamp,
  setDoc,
  orderBy, // Added for potential sorting
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";

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
  createdAt: any; // Use 'any' or a Firestore Timestamp type if specific typing needed
  commentsCount: number; // Ensure this is part of the interface
}

interface NewPost {
  title: string;
  content: string;
}

type CommunityConfig = {
  name: string;
  description: string;
  members: number;
  created: string;
  rules: string[];
};

const COMMUNITIES: Record<string, CommunityConfig> = {
  frontend: {
    name: "dev/frontend",
    description:
      "A community for frontend developers to discuss modern web development technologies like React, Vue, Angular, and CSS frameworks.",
    members: 234567,
    created: "Jan 15, 2022",
    rules: [
      "Post must be related to frontend development",
      "Include code samples when asking for help",
      "No framework wars - be respectful",
      "Use appropriate tags for posts",
    ],
  },
  backend: {
    name: "dev/backend",
    description:
      "Discussion forum for backend developers working with Node.js, Python, Java, databases, and server architecture.",
    members: 189432,
    created: "Mar 10, 2021",
    rules: [
      "Focus on server-side technologies",
      "Include security considerations",
      "No spam API promotions",
      "Database optimization topics welcome",
    ],
  },
  devops: {
    name: "dev/devops",
    description:
      "Community for DevOps engineers discussing CI/CD, cloud infrastructure, containerization, and system reliability.",
    members: 156789,
    created: "Aug 5, 2020",
    rules: [
      "Cloud platform neutral discussions",
      "Include real-world use cases",
      "No recruitment posts",
      "Share monitoring/alerting best practices",
    ],
  },
  mobile: {
    name: "dev/mobile",
    description:
      "Mobile development community for iOS, Android, and cross-platform technologies like Flutter and React Native.",
    members: 198765,
    created: "Nov 22, 2021",
    rules: [
      "Specify platform in post titles",
      "No app promotion without code samples",
      "Include performance metrics",
      "UI/UX best practices discussions",
    ],
  },
  ai: {
    name: "dev/ai",
    description:
      "Artificial Intelligence and Machine Learning community discussing ML models, NLP, computer vision, and AI ethics.",
    members: 287654,
    created: "Feb 14, 2023",
    rules: [
      "Clearly state model architectures",
      "Ethical AI discussions encouraged",
      "No sensitive data sharing",
      "Include evaluation metrics",
    ],
  },
  web3: {
    name: "dev/web3",
    description:
      "Web3 development community focused on blockchain, smart contracts, decentralized apps, and cryptocurrency technologies.",
    members: 165432,
    created: "Jun 7, 2022",
    rules: [
      "No financial advice or token promotion",
      "Smart contract security focus",
      "Include testnet examples",
      "Decentralized architecture discussions",
    ],
  },
};

interface PageParams {
  params: {
    communityName: string;
  };
}

export default function FrontendCommunityPage({ params }: PageParams) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [newPost, setNewPost] = useState<NewPost>({ title: "", content: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isVoting, setIsVoting] = useState<Record<string, boolean>>({});
  const [isJoiningOrLeaving, setIsJoiningOrLeaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isCreatePostDialogOpen, setIsCreatePostDialogOpen] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true); // Added loading state
  const { toast } = useToast();

  const unwrappedParams = use(
    params as unknown as Usable<{ communityName: string }>
  );
  const { communityName } = unwrappedParams;
  const communityInfo = COMMUNITIES[communityName] || COMMUNITIES.frontend; // Default to frontend if name invalid

  // --- Authentication and Membership Check Effect ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkMembership(currentUser.uid);
      } else {
        setIsJoined(false); // Reset membership if user logs out
      }
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, [communityName]); // Rerun if communityName changes (though unlikely in this structure)

  // --- Fetch Posts Effect ---
  useEffect(() => {
    fetchPosts();
  }, [communityName]); // Fetch posts when community changes

  const checkMembership = async (userId: string) => {
    if (!userId || !communityName) return;
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Ensure communities field exists and is an array before checking
        setIsJoined(
          Array.isArray(userData.communities) &&
            userData.communities.includes(communityName)
        );
      } else {
        // User document doesn't exist, so they haven't joined any community yet
        setIsJoined(false);
      }
    } catch (error) {
      console.error("Error checking membership:", error);
      setIsJoined(false); // Assume not joined on error
      // Avoid showing toast for a common scenario like doc not existing initially
      // toast({
      //   title: "Error",
      //   description: "Could not verify community membership.",
      //   variant: "destructive",
      // });
    }
  };

  const fetchPosts = async () => {
    setIsLoadingPosts(true); // Start loading
    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("community", "==", communityName),
        orderBy("createdAt", "desc") // Order posts by creation time, newest first
      );
      const querySnapshot = await getDocs(postsQuery);

      // Map initial post data and create promises to fetch comment counts
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
          createdAt: postData.createdAt?.toDate() || null, // Convert Firestore Timestamp to JS Date
        };

        // --- Fetch comment count for this specific post ---
        // NOTE: This adds N reads, where N is the number of posts.
        // Consider denormalization (storing count on post doc) for better performance.
        const commentsQuery = query(
          collection(db, "comments"), // Assuming comments are in a 'comments' collection
          where("postId", "==", postBase.id)
        );

        try {
          // Fetch comment documents and get the count from the snapshot size
          const commentsSnapshot = await getDocs(commentsQuery);
          const commentsCount = commentsSnapshot.size;

          return {
            ...postBase,
            commentsCount: commentsCount, // Add the fetched count
          };
        } catch (countError) {
          console.error(
            `Error fetching comment count for post ${postBase.id}:`,
            countError
          );
          return {
            // Return post data even if count fails, with count 0
            ...postBase,
            commentsCount: 0,
          };
        }
      });

      // Wait for all comment count fetches to complete
      const postsWithCounts = await Promise.all(postsDataPromises);

      setPosts(postsWithCounts as Post[]); // Set state with posts including comment counts
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts.",
        variant: "destructive",
      });
      setPosts([]); // Clear posts on error
    } finally {
      setIsLoadingPosts(false); // Finish loading
    }
  };

  const handleJoin = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join.",
        variant: "destructive",
      });
      return;
    }
    setIsJoiningOrLeaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      // Use setDoc with merge: true to handle document creation or update
      await setDoc(
        userRef,
        {
          // It's good practice to store basic info when creating the doc
          uid: user.uid,
          email: user.email,
          communities: arrayUnion(communityName),
        },
        { merge: true } // Creates doc if not exists, merges if exists
      );

      setIsJoined(true);
      toast({ title: "Success", description: `Joined ${communityInfo.name}!` });
    } catch (error) {
      console.error("Error joining community:", error);
      toast({
        title: "Error",
        description: "Failed to join. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoiningOrLeaving(false);
    }
  };

  const handleLeave = async () => {
    if (!user) return; // Should not happen if button is shown correctly, but good check

    setIsJoiningOrLeaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      // Update requires the document to exist. If it might not, check first or use setDoc with merge.
      // However, logically, a user must have joined (doc exists) to leave.
      await updateDoc(userRef, {
        communities: arrayRemove(communityName),
      });
      setIsJoined(false);
      toast({
        title: "Community Left",
        description: `You left ${communityInfo.name}.`,
      });
    } catch (error) {
      // Handle potential error where doc doesn't exist, though unlikely for 'leave'
      console.error("Error leaving community:", error);
      if ((error as any)?.code === "not-found") {
        toast({
          title: "Error",
          description: "User data not found. Could not leave community.",
          variant: "destructive",
        });
        setIsJoined(false); // Correct state if doc was missing
      } else {
        toast({
          title: "Error",
          description: "Failed to leave. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsJoiningOrLeaving(false);
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Optional: Add validation for file size or type here
      setImageFile(file);
    } else {
      setImageFile(null);
    }
  };

  const uploadImageToCloudinary = async (
    file: File
  ): Promise<string | null> => {
    // Keep your Cloudinary logic as is, but ensure CLOUD_NAME and UPLOAD_PRESET are correct
    const CLOUD_NAME =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dveyq6ldw"; // Use env variables if possible
    const UPLOAD_PRESET =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "devseekpreset"; // Use env variables if possible

    if (
      !CLOUD_NAME ||
      !UPLOAD_PRESET ||
      CLOUD_NAME === "YOUR_CLOUD_NAME" ||
      UPLOAD_PRESET === "YOUR_UPLOAD_PRESET"
    ) {
      toast({
        title: "Configuration Error",
        description: "Cloudinary environment variables not set.",
        variant: "destructive",
      });
      console.error("Cloudinary CLOUD_NAME or UPLOAD_PRESET not configured.");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    setIsUploading(true);
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (response.ok && data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Cloudinary upload failed");
      }
    } catch (error: any) {
      console.error("Cloudinary upload error:", error);
      toast({
        title: "Image Upload Failed",
        description: `${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a post.",
        variant: "destructive",
      });
      return;
    }
    if (!isJoined) {
      toast({
        title: "Join required",
        description: `You must join ${communityInfo.name} to post.`,
        variant: "destructive",
      });
      return;
    }
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Missing Fields",
        description: "Post title and content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPost(true);
    let uploadedImageUrl: string | null = null;

    if (imageFile) {
      uploadedImageUrl = await uploadImageToCloudinary(imageFile);
      if (!uploadedImageUrl) {
        setIsCreatingPost(false);
        return;
      }
    }

    try {
      await addDoc(collection(db, "posts"), {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        imageUrl: uploadedImageUrl || "",
        authorId: user.uid,
        authorEmail: user.email || "Anonymous",
        community: communityName,
        upvotes: 0,
        downvotes: 0,
        upvotedBy: [],
        downvotedBy: [],
        createdAt: serverTimestamp(),
        commentsCount: 0,
      });

      setNewPost({ title: "", content: "" });
      setImageFile(null);
      const fileInput = document.getElementById(
        "imageUpload"
      ) as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      setIsCreatePostDialogOpen(false);
      await fetchPosts();
      toast({ title: "Success", description: "Your post has been created!" });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleVote = async (
    postId: string,
    voteType: "upvote" | "downvote"
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Sign in to vote.",
        variant: "destructive",
      });
      return;
    }

    if (isVoting[postId]) return;

    setIsVoting((prev) => ({ ...prev, [postId]: true }));

    const postRef = doc(db, "posts", postId);
    const userId = user.uid;

    try {
      const batch = writeBatch(db);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }

      const postData = postDoc.data() as Post;
      const upvotedBy = postData.upvotedBy || [];
      const downvotedBy = postData.downvotedBy || [];
      const hasUpvoted = upvotedBy.includes(userId);
      const hasDownvoted = downvotedBy.includes(userId);

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
            batch.update(postRef, {
              downvotes: increment(-1),
              downvotedBy: arrayRemove(userId),
            });
          }
        }
      } else {
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
            batch.update(postRef, {
              upvotes: increment(-1),
              upvotedBy: arrayRemove(userId),
            });
          }
        }
      }

      await batch.commit();

      await fetchPosts();
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to register vote. Please try again.",
        variant: "destructive",
      });
      await fetchPosts();
    } finally {
      setIsVoting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 mt-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="hidden md:block md:col-span-2">
            <div className="sticky top-20 w-full space-y-2">
              <Link
                href="/"
                className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                href="/members"
                className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Members</span>
              </Link>
            </div>
          </div>

          <div className="col-span-12 md:col-span-7">
            <div className="space-y-4">
              {isLoadingPosts && (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {!isLoadingPosts && posts.length === 0 && (
                <Card className="p-6 text-center text-muted-foreground">
                  No posts found in {communityInfo.name} yet.
                  {user && isJoined && " Why not create the first one?"}
                  {user && !isJoined && " Join the community to create a post!"}
                  {!user && " Log in and join the community to post!"}
                </Card>
              )}

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
                      <Link
                        href={`/dev/${communityName}/post/${post.id}`}
                        passHref
                      >
                        <Card className="p-0 hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer flex">
                          {" "}
                          <div
                            className="flex flex-col items-center gap-1 p-3 bg-muted/30 flex-shrink-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Upvote"
                              title="Upvote"
                              onClick={(e) => {
                                e.preventDefault();
                                handleVote(post.id, "upvote");
                              }}
                              disabled={isVoting[post.id] || !user}
                              className={`p-1 h-auto rounded-md ${
                                // Rounded corners
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

                            <span className="font-bold text-sm select-none py-1">
                              {" "}
                              {voteScore}
                            </span>

                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Downvote"
                              title="Downvote"
                              onClick={(e) => {
                                e.preventDefault();
                                handleVote(post.id, "downvote");
                              }}
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
                          <div className="flex-1 min-w-0 p-4">
                            {" "}
                            <div className="text-xs text-muted-foreground mb-2">
                              Posted by{" "}
                              <span className="font-medium text-foreground">
                                {post.authorEmail}
                              </span>{" "}
                              {post.createdAt && (
                                <>
                                  •{" "}
                                  {formatDistanceToNow(post.createdAt, {
                                    addSuffix: true,
                                  })}
                                </>
                              )}
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2 break-words line-clamp-2">
                              {" "}
                              {post.title}
                            </h3>
                            {!post.imageUrl && (
                              <p className="text-sm text-muted-foreground mb-3 break-words line-clamp-3">
                                {" "}
                                {post.content}
                              </p>
                            )}
                            {post.imageUrl && (
                              <div className="my-3 max-h-[400px] overflow-hidden rounded-md w-full flex justify-center items-center bg-muted">
                                {" "}
                                <Image
                                  src={post.imageUrl}
                                  alt={post.title || "Post image"}
                                  width={500}
                                  height={400}
                                  className="object-contain w-auto h-auto max-w-full max-h-[400px] rounded-md"
                                  priority={false}
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-3">
                              <div className="flex items-center gap-1 hover:text-primary transition-colors">
                                <MessageSquare className="h-4 w-4" />
                                <span>
                                  {post.commentsCount} comment
                                  {post.commentsCount !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="sticky top-20 w-full space-y-4">
              <Card className="p-4">
                <h2 className="text-lg sm:text-xl font-bold mb-2">
                  {communityInfo.name}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {communityInfo.description}
                </p>
                <div className="flex items-center gap-4 mb-4 text-sm border-b pb-4">
                  <div>
                    <div className="font-bold">
                      {communityInfo.members.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                  <div>
                    <div className="font-bold">{communityInfo.created}</div>
                    <div className="text-xs text-muted-foreground">Created</div>
                  </div>
                </div>

                {!user ? (
                  <Button
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Please log in",
                        description:
                          "Log in or sign up to join communities and post.",
                      });
                    }}
                  >
                    Login to Join
                  </Button>
                ) : isJoined ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled={isJoiningOrLeaving}
                      >
                        {isJoiningOrLeaving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}{" "}
                        Joined
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Leave {communityInfo.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          You will no longer be a member of this community, but
                          you can rejoin anytime.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isJoiningOrLeaving}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleLeave}
                          disabled={isJoiningOrLeaving}
                        >
                          {isJoiningOrLeaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Leave Community
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleJoin}
                    disabled={isJoiningOrLeaving}
                  >
                    {isJoiningOrLeaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Join Community
                  </Button>
                )}

                {user && isJoined && (
                  <Dialog
                    open={isCreatePostDialogOpen}
                    onOpenChange={setIsCreatePostDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full mt-3" variant="outline">
                        Create Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>
                          Create Post in {communityInfo.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input
                          placeholder="Title"
                          value={newPost.title}
                          onChange={(e) =>
                            setNewPost({ ...newPost, title: e.target.value })
                          }
                          maxLength={150}
                          disabled={isCreatingPost || isUploading}
                        />
                        <Textarea
                          placeholder="What's on your mind? (Markdown not supported yet)"
                          className="min-h-[150px]"
                          value={newPost.content}
                          onChange={(e) =>
                            setNewPost({ ...newPost, content: e.target.value })
                          }
                          disabled={isCreatingPost || isUploading}
                        />
                        <div>
                          <label
                            htmlFor="imageUpload"
                            className="text-sm font-medium mb-1 block cursor-pointer"
                          >
                            Upload Image (Optional)
                          </label>
                          <Input
                            id="imageUpload"
                            type="file"
                            accept="image/png, image/jpeg, image/gif, image/webp"
                            onChange={handleImageChange}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                            disabled={isCreatingPost || isUploading}
                          />
                          {imageFile && !isUploading && (
                            <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                              <span>Selected: {imageFile.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 text-destructive hover:bg-destructive/10"
                                onClick={() => setImageFile(null)}
                                title="Remove image"
                              >
                                ✕
                              </Button>
                            </div>
                          )}
                          {isUploading && (
                            <div className="flex items-center text-sm text-primary mt-2">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                              Uploading image...
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button
                            variant="outline"
                            disabled={isCreatingPost || isUploading}
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          onClick={handleCreatePost}
                          disabled={
                            isCreatingPost ||
                            isUploading ||
                            !newPost.title.trim() ||
                            !newPost.content.trim()
                          }
                        >
                          {isCreatingPost || isUploading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {isUploading
                            ? "Uploading..."
                            : isCreatingPost
                            ? "Posting..."
                            : "Create Post"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </Card>

              {/* Community Rules Card */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 text-base border-b pb-2">
                  {" "}
                  {/* Add border */}
                  {communityInfo.name} Rules
                </h3>
                <ul className="space-y-2">
                  {" "}
                  {/* Increase spacing */}
                  {communityInfo.rules.map((rule, index) => (
                    <li
                      key={index}
                      className="text-xs sm:text-sm text-muted-foreground flex items-start" // Align items start
                    >
                      <span className="mr-2 font-medium text-foreground">
                        {index + 1}.
                      </span>{" "}
                      {/* Make number bold */}
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Consider adding other sidebar elements like Related Communities, Moderators, etc. */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
