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

        // Save user instantly in context
        setUser(res.data.user);

        // Redirect to dashboard
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
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white capitalize">{type}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded-md"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            {type === "signup" ? "Sign Up" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
