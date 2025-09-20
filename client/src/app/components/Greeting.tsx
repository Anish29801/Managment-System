"use client";

import { User } from "../context/AuthContext";

interface GreetingProps {
  user: User | null;
}

export const Greeting: React.FC<GreetingProps> = ({ user }) => {
  // Simple greeting based on time
  const hour = new Date().getHours();
  const timeOfDay =
    hour < 12 ? "Good Morning" : hour < 16 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="mb-4 text-white font-semibold text-lg">
      Hi, {user ? user.name : "Guest"}! {user && timeOfDay}
    </div>
  );
};
