"use client";

import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { useUser } from "@/components/lib/contexts/user-context";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase"; // Added db import
import { doc, getDoc } from "firebase/firestore"; // Added Firestore imports
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react"; // Added useState
import { ChevronDown } from "lucide-react";

export function Navbar() {
  const { userDisplayName, setUserDisplayName } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [profilePicture, setProfilePicture] = useState(""); // Default placeholder

  // Fetch user profile picture from Firestore
  useEffect(() => {
    const fetchUserProfilePic = async () => {
      if (!auth.currentUser) return;

      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().profilePicture) {
          setProfilePicture(userDoc.data().profilePicture);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchUserProfilePic();
  }, [userDisplayName]); // Re-fetch when userDisplayName changes

  // Add padding to prevent layout shift when dropdown opens
  useEffect(() => {
    // Function to calculate scrollbar width
    const getScrollbarWidth = () => {
      // Create a temporary div
      const outer = document.createElement("div");
      outer.style.visibility = "hidden";
      outer.style.overflow = "scroll";
      document.body.appendChild(outer);

      // Create inner div
      const inner = document.createElement("div");
      outer.appendChild(inner);

      // Calculate scrollbar width
      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

      // Clean up
      outer.parentNode?.removeChild(outer);

      return scrollbarWidth;
    };

    // Apply padding to prevent layout shift
    const scrollbarWidth = getScrollbarWidth();

    // Apply padding when dropdown opens
    const handleDropdownOpen = () => {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflowY = "hidden";
    };

    // Remove padding when dropdown closes
    const handleDropdownClose = () => {
      document.body.style.paddingRight = "";
      document.body.style.overflowY = "";
    };

    // Add listeners for dropdown events
    document.addEventListener("dropdown-open", handleDropdownOpen);
    document.addEventListener("dropdown-close", handleDropdownClose);

    // Clean up event listeners
    return () => {
      document.removeEventListener("dropdown-open", handleDropdownOpen);
      document.removeEventListener("dropdown-close", handleDropdownClose);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUserDisplayName(null);
      setProfilePicture("/"); // Reset profile picture on logout
      router.push("/signin");
      toast({
        title: "Success",
        description: "Successfully logged out",
      });
    } catch (error) {
      console.log("Logout Error (Navbar) : ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="fixed top-0 w-full border-b border-primary/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">DevSeek</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          {/* Features Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary focus:outline-none">
              Features
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="elegant-shadow glass border-primary/20 w-56"
            >
              <Link href="/course-recommender">
                <DropdownMenuItem className="cursor-pointer group">
                  <span className="transition-colors">Course Recommender</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/roadmap-generator">
                <DropdownMenuItem className="cursor-pointer group">
                  <span className="transition-colors">Roadmap Generator</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/resume-builder">
                <DropdownMenuItem className="cursor-pointer group">
                  <span className="transition-colors">Resume Builder</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/communities"
            className="text-sm font-medium hover:text-primary"
          >
            Community
          </Link>
          <Link
            href="/roadmap"
            className="text-sm font-medium hover:text-primary"
          >
            Progress
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {userDisplayName ? (
            <DropdownMenu
              onOpenChange={(open) => {
                // Dispatch custom events when dropdown opens/closes
                if (open) {
                  document.dispatchEvent(new CustomEvent("dropdown-open"));
                } else {
                  document.dispatchEvent(new CustomEvent("dropdown-close"));
                }
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={profilePicture || "/placeholder.svg"}
                      alt="Profile"
                    />
                    <AvatarFallback>
                      {userDisplayName ? getInitials(userDisplayName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{userDisplayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="elegant-shadow glass border-primary/20"
              >
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <Link href="/profile">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                </Link>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/signin">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
