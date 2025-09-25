"use client";

import { TaskItem } from "./TaskItem";
import { Task } from "../type";

interface TaskListProps {
  tasks: Task[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdate, onDelete }) => {
  if (tasks.length === 0)
    return <p className="text-gray-400 text-center mt-10">No tasks yet.</p>;

  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <TaskItem key={task._id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </ul>
  );
};
