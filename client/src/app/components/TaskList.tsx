"use client";

import { TaskItem } from "./TaskItem";
import { Task } from "../type";

interface TaskListProps {
  tasks: Task[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onUpdate,
  onDelete,
}) => {
  if (tasks.length === 0)
    return (
      <p className="text-gray-400 text-center mt-12 text-sm md:text-base">
        No tasks yet. Start by adding your first one!
      </p>
    );

  return (
    <ul
      className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                 auto-rows-fr"
    >
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};
