"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import axiosInstance from "@/utils/axiosConfg";
import { Camera, ArrowLeft, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; color: "green" | "red" } | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-gray-400 text-lg">Please log in to view your profile.</p>
      </div>
    );
  }

  const handleNameSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setToast({ message: "Name must be at least 2 characters", color: "red" });
      return;
    }
    setSaving(true);
    try {
      const res = await axiosInstance.patch("/users/me", { name: name.trim() });
      const updatedUser = res.data.user;
      setUser({ ...user, name: updatedUser.name, image: updatedUser.image });
      setToast({ message: "Name updated successfully", color: "green" });
    } catch {
      setToast({ message: "Failed to update name", color: "red" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: "Image must be under 2MB", color: "red" });
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);

    setUploading(true);
    try {
      const res = await axiosInstance.post("/users/me/profile-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedUser = res.data.user;
      setUser({ ...user, image: updatedUser.image });
      setToast({ message: "Profile picture updated", color: "green" });
    } catch {
      setToast({ message: "Failed to upload image", color: "red" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      {toast && (
        <Toast
          message={toast.message}
          color={toast.color}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        {/* Profile card */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700 p-8">
          <h1 className="text-2xl font-semibold text-white mb-8">Profile Settings</h1>

          {/* Profile picture section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              {user.image ? (
                <img
                  src={`http://localhost:8080${user.image}`}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div
                  className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 border-blue-500 ${
                    user.color || "bg-gray-600"
                  }`}
                >
                  {user.name[0].toUpperCase()}
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 p-2 rounded-full shadow-lg transition disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={18} className="animate-spin text-white" />
                ) : (
                  <Camera size={18} className="text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <p className="text-gray-400 text-sm mt-3">
              Click the camera icon to change profile picture
            </p>
          </div>

          {/* Name section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="Enter your name"
                />
                <button
                  onClick={handleNameSave}
                  disabled={saving || name.trim() === user.name}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600 cursor-not-allowed"
              />
              <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
