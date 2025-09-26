"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType } from "../type";
import axiosInstance from "@/utils/axiosConfg";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // 🎨 Avatar colors list
  const avatarColors = [
    "bg-blue-600",
    "bg-green-600",
    "bg-red-600",
    "bg-yellow-600",
    "bg-purple-600",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // ⬅️ skip request if no token

      try {
        const res = await axiosInstance.get("/users/me");
        const data = res.data;

        // 🎨 assign color based on first letter
        const name = data.user?.name || "G";
        const color =
          avatarColors[name.charCodeAt(0) % avatarColors.length] || "bg-gray-600";

        setUser({ ...data.user, color });
      } catch (err) {
        setUser(null);
        localStorage.removeItem("token");
      }
    };

    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        color: user?.color || "bg-gray-600",
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
