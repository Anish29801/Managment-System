"use client";

import { TaskItemProps } from "../type";

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate }) => {
  return (
    <li
      onClick={() => onUpdate(task)}
      className="bg-[#101828] p-4 rounded-xl shadow-md cursor-pointer
                 hover:bg-[#1f2937] transition-colors duration-300
                 flex flex-col gap-3 border border-gray-800 w-full"
    >
      {/* Title */}
      <h2 className="text-lg md:text-xl font-semibold text-white truncate">
        {task.title}
      </h2>

      {/* Description */}
      {task.description && (
        <p className="text-gray-400 text-sm md:text-base line-clamp-3 break-words">
          {task.description}
        </p>
      )}

      {/* Meta info */}
      <div className="text-xs md:text-sm text-gray-400 flex flex-wrap gap-3">
        <span className="flex-shrink-0">
          <strong className="text-gray-300">Status:</strong> {task.status}
        </span>
        <span className="flex-shrink-0">
          <strong className="text-gray-300">Priority:</strong> {task.priority}
        </span>
        {task.dueDate && (
          <span className="flex-shrink-0">
            <strong className="text-gray-300">Due:</strong>{" "}
            {task.dueDate.split("T")[0]}
          </span>
        )}
      </div>

      {/* Subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          <strong className="text-gray-300 text-sm w-full">Subtasks:</strong>
          {task.subtasks.map((s) => (
            <span
              key={s.title}
              className="bg-gray-700 text-white px-2 py-1 rounded-full text-xs shadow-sm break-words"
            >
              {s.title}
            </span>
          ))}
        </div>
      )}
    </li>
  );
};

export default TaskItem;
