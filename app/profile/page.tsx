/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Globe,
  Tag,
  Camera,
  X,
  Plus,
  Save,
  Home,
  Calendar,
  Users2,
  BookOpen,
  BarChart3,
  Github,
  Twitter,
  Linkedin,
  Globe2,
  MapPin,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  profilePicture: string;
  language: string;
  tags: string[];
  location: string;
  github: string;
  twitter: string;
  linkedin: string;
  website: string;
}

const defaultProfile: UserProfile = {
  name: "",
  email: "",
  bio: "",
  profilePicture: "/",
  language: "English",
  tags: [],
  location: "",
  github: "",
  twitter: "",
  linkedin: "",
  website: "",
};

const CLOUDINARY_UPLOAD_PRESET = "devseekpreset";
const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dveyq6ldw";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>(defaultProfile);
  const [newTag, setNewTag] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          router.push("/signin");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setUser(userData);
          setEditedUser(userData);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router, toast]);

  const handleTagAdd = () => {
    if (newTag && !editedUser.tags.includes(newTag)) {
      setEditedUser({
        ...editedUser,
        tags: [...editedUser.tags, newTag],
      });
      setNewTag("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setEditedUser({
      ...editedUser,
      tags: editedUser.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  // Function to upload image to Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);

        // Create temporary local URL for preview
        const localImageUrl = URL.createObjectURL(file);
        setEditedUser({
          ...editedUser,
          profilePicture: localImageUrl,
        });

        const cloudinaryUrl = await uploadImageToCloudinary(file);

        setEditedUser({
          ...editedUser,
          profilePicture: cloudinaryUrl,
        });

        toast({
          title: "Success",
          description: "Profile picture uploaded successfully",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to upload profile picture",
        });

        setEditedUser({
          ...editedUser,
          profilePicture: user.profilePicture,
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No authenticated user found",
        });
        return;
      }

      await updateDoc(doc(db, "users", currentUser.uid), {
        ...editedUser,
      });

      setUser(editedUser);
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <aside className="fixed left-0 top-0 z-30 h-full w-64 border-r border-primary/10 bg-card/80 backdrop-blur-xl">
        <nav className="p-4 mt-16">
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
              variant="ghost"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/roadmap-generator">
                <BarChart3 className="h-4 w-4" />
                Roadmaps
              </Link>
            </Button>
          </div>
        </nav>
      </aside>

      <main className="pl-64 mt-16">
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  <Card className="md:col-span-1 elegant-shadow glass">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 relative">
                        <Avatar className="h-24 w-24 border-4 border-background">
                          <AvatarImage
                            src={
                              isEditing
                                ? editedUser.profilePicture
                                : user.profilePicture
                            }
                          />
                          <AvatarFallback className="text-2xl">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <button
                            onClick={handleProfilePictureClick}
                            className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white hover:bg-primary/90 transition-colors"
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileChange}
                              disabled={isUploading}
                            />
                          </button>
                        )}
                      </div>
                      <CardTitle>
                        {isEditing ? editedUser.name : user.name}
                      </CardTitle>
                      <CardDescription>
                        {isEditing ? editedUser.email : user.email}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary" />
                          <span>
                            {isEditing ? editedUser.language : user.language}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="h-4 w-4 text-primary" />
                            <span>Skills</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(isEditing ? editedUser.tags : user.tags).map(
                              (tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="bg-primary/10"
                                >
                                  {tag}
                                  {isEditing && (
                                    <button
                                      onClick={() => handleTagRemove(tag)}
                                      className="ml-1 text-muted-foreground hover:text-foreground"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                        {!isEditing && (
                          <Button
                            onClick={() => setIsEditing(true)}
                            className="w-full mt-4 hover-lift"
                          >
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2 elegant-shadow glass">
                    <CardHeader>
                      <CardTitle>Profile Details</CardTitle>
                      <CardDescription>
                        {isEditing
                          ? "Edit your profile information below"
                          : "Your personal and professional information"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="flex items-center border rounded-md pl-3 bg-background">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <Input
                                id="name"
                                value={editedUser.name}
                                onChange={(e) =>
                                  setEditedUser({
                                    ...editedUser,
                                    name: e.target.value,
                                  })
                                }
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="flex items-center border rounded-md pl-3 bg-background">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <Input
                                id="email"
                                type="email"
                                value={editedUser.email}
                                onChange={(e) =>
                                  setEditedUser({
                                    ...editedUser,
                                    email: e.target.value,
                                  })
                                }
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={editedUser.bio}
                              onChange={(e) =>
                                setEditedUser({
                                  ...editedUser,
                                  bio: e.target.value,
                                })
                              }
                              rows={4}
                              className="resize-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="language">Preferred Language</Label>
                            <Select
                              value={editedUser.language}
                              onValueChange={(value) =>
                                setEditedUser({
                                  ...editedUser,
                                  language: value,
                                })
                              }
                            >
                              <SelectTrigger id="language">
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                {languages.map((language) => (
                                  <SelectItem key={language} value={language}>
                                    {language}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="flex items-center border rounded-md pl-3 bg-background">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <Input
                                id="location"
                                value={editedUser.location}
                                onChange={(e) =>
                                  setEditedUser({
                                    ...editedUser,
                                    location: e.target.value,
                                  })
                                }
                                placeholder="City, Country"
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="github">GitHub Username</Label>
                            <div className="flex items-center border rounded-md pl-3 bg-background">
                              <Github className="h-4 w-4 text-muted-foreground" />
                              <Input
                                id="github"
                                value={editedUser.github}
                                onChange={(e) =>
                                  setEditedUser({
                                    ...editedUser,
                                    github: e.target.value,
                                  })
                                }
                                placeholder="username"
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="twitter">Twitter Username</Label>
                            <div className="flex items-center border rounded-md pl-3 bg-background">
                              <Twitter className="h-4 w-4 text-muted-foreground" />
                              <Input
                                id="twitter"
                                value={editedUser.twitter}
                                onChange={(e) =>
                                  setEditedUser({
                                    ...editedUser,
                                    twitter: e.target.value,
                                  })
                                }
                                placeholder="username"
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn Username</Label>
                            <div className="flex items-center border rounded-md pl-3 bg-background">
                              <Linkedin className="h-4 w-4 text-muted-foreground" />
                              <Input
                                id="linkedin"
                                value={editedUser.linkedin}
                                onChange={(e) =>
                                  setEditedUser({
                                    ...editedUser,
                                    linkedin: e.target.value,
                                  })
                                }
                                placeholder="username"
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="website">Personal Website</Label>
                            <div className="flex items-center border rounded-md pl-3 bg-background">
                              <Globe2 className="h-4 w-4 text-muted-foreground" />
                              <Input
                                id="website"
                                value={editedUser.website}
                                onChange={(e) =>
                                  setEditedUser({
                                    ...editedUser,
                                    website: e.target.value,
                                  })
                                }
                                placeholder="https://example.com"
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tags">Skills/Tags</Label>
                            <div className="flex gap-2">
                              <Input
                                id="tags"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add a skill or tag"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleTagAdd();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleTagAdd}
                                className="shrink-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={handleCancel}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSave}
                              className="gap-2 hover-lift glow"
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">
                              Bio
                            </h3>
                            <p>{user.bio}</p>
                          </div>

                          <Separator />

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                Personal Information
                              </h3>
                              <dl className="space-y-2">
                                <div className="flex justify-between">
                                  <dt className="font-medium">Full Name</dt>
                                  <dd>{user.name}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="font-medium">Email</dt>
                                  <dd>{user.email}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="font-medium">Language</dt>
                                  <dd>{user.language}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="font-medium">Location</dt>
                                  <dd>{user.location || "Not specified"}</dd>
                                </div>
                              </dl>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                Social Profiles
                              </h3>
                              <dl className="space-y-2">
                                <div className="flex justify-between">
                                  <dt className="font-medium">GitHub</dt>
                                  <dd>
                                    {user.github ? (
                                      <a
                                        href={`https://github.com/${user.github}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        @{user.github}
                                      </a>
                                    ) : (
                                      "Not specified"
                                    )}
                                  </dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="font-medium">Twitter</dt>
                                  <dd>
                                    {user.twitter ? (
                                      <a
                                        href={`https://twitter.com/${user.twitter}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        @{user.twitter}
                                      </a>
                                    ) : (
                                      "Not specified"
                                    )}
                                  </dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="font-medium">LinkedIn</dt>
                                  <dd>
                                    {user.linkedin ? (
                                      <a
                                        href={`https://linkedin.com/in/${user.linkedin}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        {user.linkedin}
                                      </a>
                                    ) : (
                                      "Not specified"
                                    )}
                                  </dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="font-medium">Website</dt>
                                  <dd>
                                    {user.website ? (
                                      <a
                                        href={user.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        {user.website}
                                      </a>
                                    ) : (
                                      "Not specified"
                                    )}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <Card className="elegant-shadow glass">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent actions and contributions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Activity content will be displayed here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="elegant-shadow glass">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Settings content will be displayed here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
