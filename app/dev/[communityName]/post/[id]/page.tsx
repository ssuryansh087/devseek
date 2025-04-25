/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Reply, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { Navbar } from "@/components/navbar";

interface Post {
  id: string;
  title: string;
  authorEmail?: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  createdAt: Date | null;
}

interface Comment {
  id: string;
  authorEmail?: string;
  authorId: string;
  content: string;
  createdAt: Date | null;
  parentId: string | null;
  postId: string;
  depth: number;
}

interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

const CommentComponent = React.memo(
  ({
    comment,
    replies,
    depth = 0,
    setReplyTo,
    newComment,
    setNewComment,
    handleComment,
    MAX_COMMENT_DEPTH,
    replyTo,
  }: {
    comment: Comment;
    replies: CommentWithReplies[];
    depth?: number;
    setReplyTo: any;
    newComment: string;
    setNewComment: any;
    handleComment: () => void;
    MAX_COMMENT_DEPTH: number;
    replyTo: { id: string | null; author: string; depth: number };
  }) => {
    const canReply = depth < MAX_COMMENT_DEPTH;

    return (
      <div className="mt-4">
        <div className="flex gap-4">
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              {comment.authorEmail ? comment.authorEmail[0] : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{comment.authorEmail}</span>
              <span className="text-xs text-muted-foreground">
                •{" "}
                {comment.createdAt
                  ? formatDistanceToNow(comment.createdAt, { addSuffix: true })
                  : "just now"}
              </span>
            </div>
            <p className="mt-2 text-sm">{comment.content}</p>
            <div className="mt-2 flex items-center gap-2">
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2"
                  onClick={() =>
                    setReplyTo({
                      id: comment.id,
                      author: comment.authorEmail || "",
                      depth: comment.depth,
                    })
                  }
                >
                  <Reply className="h-4 w-4" />
                  Reply
                </Button>
              )}
            </div>
          </div>
        </div>

        {replyTo.id === comment.id && (
          <div className="ml-8 mt-2">
            <div className="text-xs text-muted-foreground mb-2">
              Replying to {replyTo.author}
            </div>
            <Textarea
              key={`reply-to-${comment.id}`}
              placeholder="Write your reply..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo({ id: null, author: "", depth: 0 })}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={handleComment}
                disabled={!newComment.trim()}
              >
                <Send className="h-3 w-3" />
                Reply
              </Button>
            </div>
          </div>
        )}

        {replies.length > 0 && (
          <div
            className={`ml-8 border-l-2 border-primary/10 pl-4 ${
              depth >= MAX_COMMENT_DEPTH - 1 ? "opacity-80" : ""
            }`}
          >
            {replies.map((reply) => (
              <CommentComponent
                key={reply.id}
                comment={reply}
                replies={reply.replies}
                depth={depth + 1}
                setReplyTo={setReplyTo}
                newComment={newComment}
                setNewComment={setNewComment}
                handleComment={handleComment}
                MAX_COMMENT_DEPTH={MAX_COMMENT_DEPTH}
                replyTo={replyTo}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = React.use(params);
  const postId = unwrappedParams.id;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: string | null;
    author: string;
    depth: number;
  }>({ id: null, author: "", depth: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const MAX_COMMENT_DEPTH = 5;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, "posts", postId));
        if (!postDoc.exists()) {
          router.replace("/dev/frontend");
          return;
        }
        const postData = postDoc.data() as Omit<Post, "id">;
        setPost({
          id: postDoc.id,
          ...postData,
          authorEmail: postData.authorEmail || "Anonymous User",
          createdAt:
            postData.createdAt instanceof Date
              ? postData.createdAt
              : (postData.createdAt as any)?.toDate?.() || null,
        });

        const commentsQuery = query(
          collection(db, "comments"),
          where("postId", "==", postId),
          orderBy("createdAt", "desc")
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsData = commentsSnapshot.docs.map((doc) => {
          const commentData = doc.data() as Omit<Comment, "id">;
          return {
            id: doc.id,
            ...commentData,
            authorEmail: commentData.authorEmail || "Anonymous User",
            depth: commentData.depth || 0,
            createdAt:
              commentData.createdAt instanceof Date
                ? commentData.createdAt
                : (commentData.createdAt as any)?.toDate?.() || null,
          } as Comment;
        });
        setComments(commentsData);
      } catch (error) {
        console.error("Failed to fetch post or comments:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load post",
        });
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, router, toast]);

  const handleComment = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please sign in to comment",
        });
        router.push("/signin");
        return;
      }

      if (!newComment.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Comment cannot be empty",
        });
        return;
      }

      const depth = replyTo.id
        ? Math.min(replyTo.depth + 1, MAX_COMMENT_DEPTH)
        : 0;

      const commentData = {
        authorEmail:
          user.displayName || user.email?.split("@")[0] || "Anonymous User",
        authorId: user.uid,
        content: newComment.trim(),
        createdAt: serverTimestamp(),
        postId: postId,
        parentId: replyTo.id,
        depth: depth,
      };

      await addDoc(collection(db, "comments"), commentData);

      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", postId),
        orderBy("createdAt", "desc")
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData = commentsSnapshot.docs.map((doc) => {
        const commentData = doc.data() as Omit<Comment, "id">;
        return {
          id: doc.id,
          ...commentData,
          authorEmail: commentData.authorEmail || "Anonymous User",
          depth: commentData.depth || 0,
          createdAt:
            commentData.createdAt instanceof Date
              ? commentData.createdAt
              : (commentData.createdAt as any)?.toDate?.() || null,
        } as Comment;
      });
      setComments(commentsData);

      setNewComment("");
      setReplyTo({ id: null, author: "", depth: 0 });

      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post comment",
      });
    }
  }, [newComment, postId, replyTo, router, toast]);

  const buildCommentTree = useCallback(
    (
      comments: Comment[],
      parentId: string | null = null,
      depth: number = 0
    ): CommentWithReplies[] => {
      return comments
        .filter((comment) => comment.parentId === parentId)
        .map(
          (comment): CommentWithReplies => ({
            ...comment,
            replies: buildCommentTree(comments, comment.id, depth + 1),
          })
        );
    },
    []
  );

  const commentTree = buildCommentTree(comments);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          Post not found or could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-2">
            <div className="fixed w-48">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href="/dev/frontend">
                  <ArrowLeft className="h-4 w-4" />
                  Back to dev/frontend
                </Link>
              </Button>
            </div>
          </div>

          <div className="col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {post.authorEmail ? post.authorEmail[0] : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span>Posted by {post.authorEmail}</span>
                      <span>•</span>
                      <span>
                        {post.createdAt
                          ? formatDistanceToNow(post.createdAt, {
                              addSuffix: true,
                            })
                          : "just now"}
                      </span>
                    </div>
                    <h1 className="mt-2 text-2xl font-bold">{post.title}</h1>
                    <div
                      className="mt-4 text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    ></div>

                    {post.imageUrl && (
                      <div className="mt-4 relative rounded-lg overflow-hidden">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          width={800}
                          height={400}
                          className="object-cover w-full h-auto"
                          priority
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="mt-6 p-4">
                <h2 className="text-lg font-semibold">
                  Comments ({comments.length})
                </h2>

                {!replyTo.id && (
                  <div className="mt-4">
                    <Textarea
                      placeholder="What are your thoughts?"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        className="gap-2"
                        onClick={handleComment}
                        disabled={!newComment.trim()}
                      >
                        <Send className="h-4 w-4" />
                        Comment
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-6 divide-y divide-primary/10">
                  {commentTree.map((comment: CommentWithReplies) => (
                    <CommentComponent
                      key={comment.id}
                      comment={comment}
                      replies={comment.replies}
                      setReplyTo={setReplyTo}
                      newComment={newComment}
                      setNewComment={setNewComment}
                      handleComment={handleComment}
                      MAX_COMMENT_DEPTH={MAX_COMMENT_DEPTH}
                      replyTo={replyTo}
                    />
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="col-span-3">
            <div className="fixed w-72">
              <Card className="p-4">
                <h2 className="text-lg font-semibold">dev/frontend</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  A community for frontend developers to share knowledge, ask
                  questions, and stay updated with the latest trends and
                  technologies.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-medium">234.5k</span>
                  <span className="text-sm text-muted-foreground">members</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
