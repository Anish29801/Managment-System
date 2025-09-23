"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const quotes = [
  "Believe you can and you're halfway there.",
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "Happiness is not something ready made. It comes from your own actions.",
  "Do what you can, with what you have, where you are.",
];

const Details: React.FC = () => {
  const { user } = useAuth();
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  if (!user) {
    return (
      <div className="p-6 bg-gray-800 text-white rounded-lg text-center">
        No user is logged in.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg max-w-md mx-auto mt-10 shadow-md border border-gray-700">
      <h2 className="text-2xl font-semibold mb-4">User Details</h2>
      <p className="mb-2">
        <span className="font-medium">Name:</span> {user.name}
      </p>
      <p className="mb-2">
        <span className="font-medium">Email:</span> {user.email}
      </p>
      <hr className="my-4 border-gray-600" />
      <p className="italic text-blue-400 text-center">"{quote}"</p>
    </div>
  );
};

export default Details;
