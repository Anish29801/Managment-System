// client/src/components/AuthForm.tsx
"use client";

import React, { useState } from "react";
import { AxiosError } from "axios";
import { z, ZodError } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import Toast from "./Toast";
import axiosInstance from "@/utils/axiosConfg";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; color: "green" | "red" } | null>(null);

  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (type === "signup") {
        signupSchema.parse({ name, email, password, confirmPassword });
      } else {
        loginSchema.parse({ email, password });
      }

      const url = type === "signup" ? "/users/signup" : "/users/login";
      const payload = type === "signup" ? { name, email, password } : { email, password };

      const res = await axiosInstance.post(url, payload);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        setToast({
          message: type === "signup" ? "Sign Up Successful!" : "Login Successful!",
          color: "green",
        });
        router.push("/");
      }
    } catch (err) {
      if (err instanceof ZodError) {
        setToast({ message: err.issues[0].message, color: "red" });
      } else if (err instanceof AxiosError) {
        setToast({
          message: err.response?.data?.error || "An error occurred",
          color: "red",
        });
      } else {
        setToast({ message: "An unexpected error occurred", color: "red" });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 sm:px-6">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-gray-800/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700 relative">
        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            color={toast.color}
            onClose={() => setToast(null)}
          />
        )}

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 sm:mb-8 text-center text-white tracking-wide drop-shadow-md">
          {type === "signup" ? "Sign Up" : "Login"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {type === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full px-4 py-2 sm:py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm sm:text-base"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full px-4 py-2 sm:py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm sm:text-base"
              placeholder="you@example.com"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full px-4 py-2 sm:py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm sm:text-base"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 sm:top-10 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {type === "signup" && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full px-4 py-2 sm:py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm sm:text-base"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 sm:top-10 text-gray-400 hover:text-gray-200"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 sm:py-3.5 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 text-white font-semibold rounded-lg shadow-md transition text-sm sm:text-base"
          >
            {type === "signup" ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-gray-400">
          {type === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
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
