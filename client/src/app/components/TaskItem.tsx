"use client";

import { Task } from "../type";

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete }) => {
  return (
    <li className="bg-gray-800 p-4 rounded-md flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">{task.title}</h2>
        <p className="text-gray-400">{task.description}</p>
        <p className="text-sm text-gray-500">
          Priority: {task.priority} | Due: {task.dueDate || "N/A"}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onUpdate(task)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
        >
          Update
        </button>
        <button
          onClick={() => onDelete(task._id)}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm"
        >
          Delete
        </button>
      </div>
    </li>
  );
};
