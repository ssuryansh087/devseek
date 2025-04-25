"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function CommunityChats() {
  const communities = [
    {
      name: "Frontend Dev",
      lastMessage: "New React 19 features discussion",
      time: "12:30",
      unread: 2,
      members: [
        { name: "John", image: "", online: true },
        { name: "Sarah", image: "", online: false },
        { name: "Mike", image: "", online: true },
      ],
    },
    {
      name: "Backend Dev",
      lastMessage: "API optimization techniques",
      time: "11:45",
      unread: 5,
      members: [
        { name: "Alex", image: "", online: true },
        { name: "Emma", image: "", online: true },
        { name: "Tom", image: "", online: false },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Community Forums</h2>
        <span className="text-xs text-muted-foreground">5 active</span>
      </div>
      <div className="space-y-4">
        {communities.map((community) => (
          <div
            key={community.name}
            className="group rounded-lg p-2 hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={community.members[0].image} />
                    <AvatarFallback>{community.name[0]}</AvatarFallback>
                  </Avatar>
                  {community.members[0].online && (
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium">{community.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {community.lastMessage}
                  </p>
                </div>
              </div>
              {community.unread > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {community.unread}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
