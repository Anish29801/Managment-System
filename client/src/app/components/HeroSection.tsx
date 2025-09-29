// HeroSection.tsx
"use client";

export default function HeroSection() {
  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-10 text-center bg-gray-900 rounded-xl shadow-md">
      {/* Top small heading */}
      <p className="text-blue-400 font-medium mb-2 sm:mb-3 text-sm sm:text-base md:text-lg">
        Stay Organized. Stay Ahead.
      </p>

      {/* Main heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-3 sm:mb-4">
        Task Management Dashboard
      </h1>

      {/* Subtext */}
      <p className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl">
        Plan, track, and complete your tasks with ease. Boost productivity and
        keep everything in one place with{" "}
        <span className="text-blue-400 font-semibold">TaskMaster</span>.
      </p>
    </section>
  );
}
