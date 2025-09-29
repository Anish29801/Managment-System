// Toast.tsx
"use client";
import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  color?: "green" | "red" | "blue";
  duration?: number;
  onClose?: () => void;
}

const colorMap: Record<string, string> = {
  green: "bg-green-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
};

const Toast: React.FC<ToastProps> = ({
  message,
  color = "blue",
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true); // Animate in

    const timer = setTimeout(() => {
      setVisible(false); // Animate out
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`
        fixed top-4 sm:top-6 left-1/2 -translate-x-1/2
        px-4 sm:px-6 py-2 sm:py-3
        rounded-lg shadow-lg font-medium
        text-xs sm:text-sm md:text-base text-white
        z-50
        ${colorMap[color]}
        transition-all duration-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
      `}
    >
      {message}
    </div>
  );
};

export default Toast;
