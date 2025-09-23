"use client";

import { Task } from "../type";

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void; // Trigger opening the TaskForm
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate }) => {
  return (
    <li
      className="bg-[#101828] p-4 rounded-md shadow-lg cursor-pointer hover:bg-[#1f2937] flex flex-col gap-2"
      onClick={() => onUpdate(task)}
    >
      <h2 className="text-lg font-semibold text-white">{task.title}</h2>

      {task.description && (
        <p className="text-gray-400">{task.description}</p>
      )}

      <div className="text-sm text-gray-500 flex flex-wrap gap-2">
        <span><strong>Status:</strong> {task.status}</span>
        <span><strong>Priority:</strong> {task.priority}</span>
        {task.dueDate && <span><strong>Due:</strong> {task.dueDate.split("T")[0]}</span>}
        {task.subtasks && task.subtasks.length > 0 && (
          <span className="flex flex-wrap gap-1">
            <strong>Subtasks:</strong>{" "}
            {task.subtasks.map((s) => (
              <span
                key={s.title}
                className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs"
              >
                {s.title}
              </span>
            ))}
          </span>
        )}
      </div>
    </li>
  );
};

export default TaskItem;
