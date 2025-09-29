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
    <div className="w-full sm:w-full md:w-1/2 lg:w-1/3 p-2">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-4 pt-8 relative flex flex-col">
        {/* Floating label */}
        <h2 className="absolute -top-3 left-4 bg-gray-900 px-3 py-1 text-white font-bold rounded-full text-sm shadow">
          {title}
        </h2>

        <Droppable droppableId={droppableId}>
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4 min-h-[200px] mt-2 overflow-y-auto max-h-[70vh] sm:max-h-[60vh] md:max-h-[65vh]"
            >
              {tasks.length === 0 ? (
                <p className="text-gray-400 text-sm">No tasks here.</p>
              ) : (
                tasks.map((task, index) => (
                  <Draggable
                    key={task._id!}
                    draggableId={task._id!}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskItem task={task} onUpdate={onUpdate} onDelete={onDelete} />
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
    </div>
  );
};

export default TaskSection;
