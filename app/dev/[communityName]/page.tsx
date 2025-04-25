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
} from "firebase/firestore";

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
  createdAt: Date | null;
  commentsCount?: number;
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
  const { toast } = useToast();

  const unwrappedParams = use(
    params as unknown as Usable<{ communityName: string }>
  );
  const { communityName } = unwrappedParams;
  const communityInfo = COMMUNITIES[communityName] || COMMUNITIES.frontend;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkMembership(currentUser.uid);
      } else {
        setIsJoined(false);
      }
    });

    fetchPosts();

    return () => unsubscribe();
  }, []);

  const checkMembership = async (userId: string) => {
    if (!userId) return;
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsJoined(userData.communities?.includes(communityName) || false);
      } else {
        setIsJoined(false);
      }
    } catch (error) {
      console.error("Error checking membership:", error);
      setIsJoined(false);
      toast({
        title: "Error",
        description: "Could not verify community membership.",
        variant: "destructive",
      });
    }
  };

  const fetchPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("community", "==", communityName)
      );
      const querySnapshot = await getDocs(postsQuery);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Post, "id">),
      }));
      postsData.forEach((post) => {
        post.upvotedBy = post.upvotedBy || [];
        post.downvotedBy = post.downvotedBy || [];
      });
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts.",
        variant: "destructive",
      });
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
      await updateDoc(userRef, {
        communities: arrayUnion(communityName),
      });
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
    if (!user) return;

    setIsJoiningOrLeaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        communities: arrayRemove(communityName),
      });
      setIsJoined(false);
      toast({
        title: "Community Left",
        description: `You left ${communityInfo.name}.`,
      });
    } catch (error) {
      console.error("Error leaving community:", error);
      toast({
        title: "Error",
        description: "Failed to leave. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoiningOrLeaving(false);
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const uploadImageToCloudinary = async (
    file: File
  ): Promise<string | null> => {
    const CLOUD_NAME = "dveyq6ldw";
    const UPLOAD_PRESET = "devseekpreset";

    if (CLOUD_NAME !== "dveyq6ldw" || UPLOAD_PRESET !== "devseekpreset") {
      toast({
        title: "Configuration Error",
        description:
          "Cloudinary details missing in FrontendCommunityPage component.",
        variant: "destructive",
      });
      console.error(
        "Cloudinary CLOUD_NAME or UPLOAD_PRESET not configured in the code."
      );
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
        description: "Please sign in.",
        variant: "destructive",
      });
      return;
    }
    if (!isJoined) {
      toast({
        title: "Join required",
        description: "Join the community to post.",
        variant: "destructive",
      });
      return;
    }
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Missing Fields",
        description: "Title and content are required.",
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
      });

      setNewPost({ title: "", content: "" });
      setImageFile(null);
      setIsCreatePostDialogOpen(false);
      await fetchPosts();
      toast({ title: "Success", description: "Post created!" });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPost(false);
      if (isUploading) setIsUploading(false);
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

    setIsVoting((prev) => ({ ...prev, [postId]: true }));

    const postRef = doc(db, "posts", postId);
    const userId = user.uid;

    try {
      const postDoc = await getDoc(postRef);
      if (!postDoc.exists()) {
        throw new Error("Post not found");
      }

      const postData = postDoc.data() as Post;
      const upvotedBy = postData.upvotedBy || [];
      const downvotedBy = postData.downvotedBy || [];

      const hasUpvoted = upvotedBy.includes(userId);
      const hasDownvoted = downvotedBy.includes(userId);

      const batch = writeBatch(db);

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
        description: "Failed to vote.",
        variant: "destructive",
      });
    } finally {
      setIsVoting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 mt-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar */}
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

          {/* Main Content */}
          <div className="col-span-12 md:col-span-7">
            <div className="space-y-4">
              {posts.length === 0 && (
                <Card className="p-4 text-center text-muted-foreground">
                  No posts yet. Be the first!
                </Card>
              )}

              {posts.map((post) => {
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
                    transition={{ duration: 0.3 }}
                  >
                    <Link href={`/dev/${communityName}/post/${post.id}`}>
                      <Card className="p-4 hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                        <div className="flex gap-3 sm:gap-4">
                          {/* Vote Controls */}
                          <div
                            className="flex flex-col items-center gap-1 pt-1 flex-shrink-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Upvote"
                              onClick={(e) => {
                                e.preventDefault();
                                handleVote(post.id, "upvote");
                              }}
                              disabled={isVoting[post.id] || !user}
                              className={`p-1 h-auto ${
                                userVote === "up"
                                  ? "text-green-600"
                                  : "text-muted-foreground hover:text-green-500"
                              }`}
                            >
                              {isVoting[post.id] ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <ArrowBigUp className="h-5 w-5" />
                              )}
                            </Button>

                            <span className="font-bold text-sm select-none">
                              {voteScore}
                            </span>

                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label="Downvote"
                              onClick={(e) => {
                                e.preventDefault();
                                handleVote(post.id, "downvote");
                              }}
                              disabled={isVoting[post.id] || !user}
                              className={`p-1 h-auto ${
                                userVote === "down"
                                  ? "text-red-600"
                                  : "text-muted-foreground hover:text-red-500"
                              }`}
                            >
                              {isVoting[post.id] ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <ArrowBigDown className="h-5 w-5" />
                              )}
                            </Button>
                          </div>

                          {/* Post Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold mb-1 break-words">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 break-words">
                              {post.content}
                            </p>
                            {post.imageUrl && (
                              <div className="my-3 overflow-hidden rounded-md w-full">
                                <Image
                                  src={post.imageUrl}
                                  alt={post.title || "Post image"}
                                  width={0}
                                  height={0}
                                  sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 600px"
                                  className="object-cover w-full h-auto rounded-md"
                                  priority={false}
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                              <span>Posted by {post.authorEmail}</span>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{post.commentsCount || 0} comments</span>
                              </div>
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

          {/* Right Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="sticky top-20 w-full space-y-4">
              {/* Community Info Card */}
              <Card className="p-4">
                <h2 className="text-lg sm:text-xl font-bold mb-2">
                  {communityInfo.name}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {communityInfo.description}
                </p>
                <div className="flex items-center gap-4 mb-4 text-sm">
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

                {/* Join/Leave Button */}
                {user && isJoined ? (
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
                          Are you sure? You can always rejoin later.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleLeave}
                          disabled={isJoiningOrLeaving}
                        >
                          Leave Community
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleJoin}
                    disabled={isJoiningOrLeaving || !user}
                  >
                    {isJoiningOrLeaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {user ? "Join Community" : "Login to Join"}
                  </Button>
                )}
              </Card>

              {/* Community Rules Card */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2 text-base">
                  Community Rules
                </h3>
                <ul className="space-y-1.5">
                  {communityInfo.rules.map((rule, index) => (
                    <li
                      key={index}
                      className="text-xs sm:text-sm text-muted-foreground flex"
                    >
                      <span className="mr-2">{index + 1}.</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Create Post Dialog */}
              <Dialog
                open={isCreatePostDialogOpen}
                onOpenChange={setIsCreatePostDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={!isJoined || !user}
                    variant="outline"
                  >
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
                    />
                    <Textarea
                      placeholder="What's on your mind? (Supports Markdown)"
                      className="min-h-[150px]"
                      value={newPost.content}
                      onChange={(e) =>
                        setNewPost({ ...newPost, content: e.target.value })
                      }
                    />
                    <div>
                      <label
                        htmlFor="imageUpload"
                        className="text-sm font-medium mb-1 block"
                      >
                        Upload Image (Optional)
                      </label>
                      <Input
                        id="imageUpload"
                        type="file"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleImageChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                      />
                      {imageFile && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected: {imageFile.name}
                        </p>
                      )}
                      {isUploading && (
                        <div className="flex items-center text-sm text-muted-foreground mt-2">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Uploading...
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
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
                      {isCreatingPost || isUploading
                        ? "Posting..."
                        : "Create Post"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
