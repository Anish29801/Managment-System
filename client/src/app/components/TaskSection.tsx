"use client";

import { TaskItem } from "./TaskItem";
import { Task } from "../type";

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskSection: React.FC<TaskSectionProps> = ({ title, tasks, onUpdate, onDelete }) => {
  return (
    <div className="w-full md:w-1/3 p-2">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-400">No tasks here.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <TaskItem key={task._id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </div>
  );
};
