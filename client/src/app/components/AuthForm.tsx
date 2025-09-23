"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { z, ZodError } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

// Zod Schemas
const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface AuthFormProps {
  type: "login" | "signup";
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = "http://localhost:8000/users";
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (type === "signup") {
        signupSchema.parse({ name, email, password });
      } else {
        loginSchema.parse({ email, password });
      }

      const url =
        type === "signup"
          ? `${API_BASE_URL}/signup`
          : `${API_BASE_URL}/login`;

      const payload =
        type === "signup" ? { name, email, password } : { email, password };

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);

        setUser(res.data.user);
        router.push("/");
      }
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.issues[0].message);
      } else if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-gray-700">
        {/* Hydration-safe heading */}
        <h2 className="text-3xl font-semibold mb-6 text-center text-white capitalize">
          {type === "signup" ? "Sign Up" : "Login"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {type === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-medium text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 text-white font-semibold rounded-lg shadow-md transition"
          >
            {type === "signup" ? "Sign Up" : "Login"}
          </button>
        </form>

        {/* Toggle link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          {type === "signup"
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => router.push(type === "signup" ? "/login" : "/signup")}
            className="text-blue-400 hover:text-blue-300 font-medium transition"
          >
            {type === "signup" ? "Login here" : "Sign up here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
