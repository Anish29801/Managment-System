"use client";

import { TaskItem } from "./TaskItem";
import { Task } from "../type";
import { Droppable, Draggable } from "@hello-pangea/dnd";

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  droppableId: string;
}

export const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  tasks,
  onUpdate,
  onDelete,
  droppableId,
}) => {
  return (
    <div className="w-full md:w-1/3 p-2">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <ul
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4 min-h-[200px] bg-gray-900 p-2 rounded-md border border-gray-700"
          >
            {tasks.length === 0 ? (
              <p className="text-gray-400">No tasks here.</p>
            ) : (
              tasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TaskItem
                        task={task}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </div>
  );
};
