"use client";

export default function HeroSection() {
  return (
    <section className="relative w-full py-16 px-6 text-center bg-gray-900 rounded-xl shadow-md">
      {/* Top small heading */}
      <p className="text-blue-400 font-medium mb-3">
        Stay Organized. Stay Ahead.
      </p>

      {/* Main heading */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
        Task Management Dashboard
      </h1>

      {/* Subtext */}
      <p className="max-w-2xl mx-auto text-gray-400 text-base md:text-lg">
        Plan, track, and complete your tasks with ease. Boost productivity and
        keep everything in one place with{" "}
        <span className="text-blue-400 font-semibold">TaskMaster</span>.
      </p>
    </section>
  );
}
