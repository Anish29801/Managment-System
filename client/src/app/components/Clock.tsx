"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState(getCurrentTime());

  function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert to 12-hour format
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getCurrentTime());
    }, 1000); // update every second
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-white font-semibold text-lg md:text-xl">
      {time}
    </div>
  );
}
