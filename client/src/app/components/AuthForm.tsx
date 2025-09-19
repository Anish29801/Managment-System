"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { z, ZodError } from "zod";

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

const API_BASE_URL = "http://localhost:8000/users"; // ✅ ensure backend runs here

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // ✅ Validate inputs with Zod
      if (type === "signup") {
        signupSchema.parse({ name, email, password });
      } else {
        loginSchema.parse({ email, password });
      }

      // ✅ Construct request
      const url =
        type === "signup"
          ? `${API_BASE_URL}/signup`
          : `${API_BASE_URL}/login`;

      const payload =
        type === "signup"
          ? { name, email, password }
          : { email, password };

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // important if using cookies
      });

      setSuccess(res.data.message || `${type} successful`);
      console.log(`${type} response:`, res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.issues[0]?.message || "Validation failed");
      } else if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Request failed");
      } else {
        setError("Unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-2xl shadow-lg w-96 text-white"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center capitalize">
          {type === "login" ? "Login" : "Sign Up"}
        </h2>

        {error && <p className="mb-3 text-red-500 text-sm">{error}</p>}
        {success && <p className="mb-3 text-green-500 text-sm">{success}</p>}

        {type === "signup" && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-3 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {type === "login" ? "Login" : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;
