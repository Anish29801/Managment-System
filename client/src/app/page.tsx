"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting("Good Morning");
    } else if (hours < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-semibold">
        Hi, {user?.name || "There"} {greeting}
      </h1>
    </div>
  );
};

export default Dashboard;
