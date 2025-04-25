"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming you want to wrap links in a Button for styling

export function CommunityChats() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCommunities, setUserCommunities] = useState<string[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);

  useEffect(() => {
    setIsLoadingCommunities(true);
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserCommunities(
              Array.isArray(userData.communities) ? userData.communities : []
            );
          } else {
            setUserCommunities([]);
          }
        } catch (error) {
          console.error("Error fetching user communities:", error);
          setUserCommunities([]);
        } finally {
          setIsLoadingCommunities(false);
        }
      } else {
        setCurrentUser(null);
        setUserCommunities([]);
        setIsLoadingCommunities(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Your Communities</h2>
        <span className="text-xs text-muted-foreground">
          {isLoadingCommunities ? (
            <Loader2 className="h-3 w-3 animate-spin inline-block mr-1" />
          ) : (
            userCommunities.length
          )}{" "}
          joined
        </span>
      </div>
      <div className="space-y-1">
        {isLoadingCommunities ? (
          <div className="flex justify-center p-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !currentUser ? (
          <p className="px-2 text-sm text-muted-foreground">
            Log in to see your communities.
          </p>
        ) : userCommunities.length > 0 ? (
          userCommunities.map((communityName) => (
            <Button
              key={communityName}
              variant="ghost"
              className="w-full h-8 justify-start px-2 rounded text-sm hover:bg-accent"
              asChild
            >
              <Link href={`/dev/${communityName}`}>
                {`dev/${communityName}`}
              </Link>
            </Button>
          ))
        ) : (
          <p className="px-2 text-sm text-muted-foreground">
            You haven&apos;t joined any communities yet.
          </p>
        )}
      </div>
    </div>
  );
}
