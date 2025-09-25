"use client";
import {CardProps} from "../type";

export default function Card({ icon, title, description }: CardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-gray-800/70 rounded-xl shadow-lg hover:scale-105 transform transition duration-300">
      <div className="text-blue-400 text-3xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
