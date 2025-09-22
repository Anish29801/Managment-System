"use client";

import { Task } from "../type";

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate }) => {
  return (
    <li
      className="bg-[#101828] p-4 rounded-md flex flex-col shadow-lg cursor-pointer hover:bg-[#1f2937]"
      onClick={() => onUpdate(task)}
    >
      <h2 className="text-lg font-semibold text-white">{task.title}</h2>
      <p className="text-gray-400">{task.description}</p>
      <p className="text-sm text-gray-500">
        Priority: {task.priority} | Due: {task.dueDate || "N/A"} | Status: {task.status}
      </p>
    </li>
  );
};
