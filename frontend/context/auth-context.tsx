"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { toast } from "react-toastify";

import { hasRefreshToken } from "@/actions/auth";
import { User } from "@/types/response";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (await hasRefreshToken()) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/profile`,
            {
              credentials: "include",
            },
          );
          const result = await res.json();

          if (res.ok && result.success) {
            setUser(result.data);
          }
        } catch (error) {
          console.error("Error: ", error);
          toast.error("Connection error.");
        } finally {
          setAuthLoading(false);
        }
      }
    };

    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
};
