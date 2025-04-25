"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";

interface UserContextType {
  user: User | null;
  userDisplayName: string | null;
  setUserDisplayName: (name: string | null) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userDisplayName: null,
  setUserDisplayName: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("userDisplayName");
    if (storedName) {
      setUserDisplayName(storedName);
    }
  }, []);

  const handleSetUserDisplayName = (name: string | null) => {
    setUserDisplayName(name);
    if (name) {
      localStorage.setItem("userDisplayName", name);
    } else {
      localStorage.removeItem("userDisplayName");
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userDisplayName,
        setUserDisplayName: handleSetUserDisplayName,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
