"use client";

import { Task } from "../type";

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  return (
    <li className="bg-[#101828] p-4 rounded-md flex justify-between items-center shadow-lg cursor-pointer hover :shadow-xl transition-shadow">
      <div>
        <h2 className="text-lg font-semibold">{task.title}</h2>
        <p className="text-gray-400">{task.description}</p>
        <p className="text-sm text-gray-500">
          Priority: {task.priority} | Due: {task.dueDate || "N/A"}
        </p>
      </div>
    </li>
  );
};
