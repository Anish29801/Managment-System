"use client";

import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  color?: "green" | "red" | "blue";
  duration?: number; // in ms
  onClose?: () => void;
}

const colorMap: Record<string, string> = {
  green: "bg-green-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
};

const Toast: React.FC<ToastProps> = ({ message, color = "blue", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return visible ? (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg font-medium text-white transition-all duration-300 z-50 ${colorMap[color]}`}
    >
      {message}
    </div>
  ) : null;
};

export default Toast;
