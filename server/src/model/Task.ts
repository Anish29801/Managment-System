import { Schema, model } from "mongoose";
import { ITask, ISubtask } from "../types";

const subtaskSchema = new Schema<ISubtask>(
  {
    title: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" }
  },
  { timestamps: true }
);

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "inprogress", "completed"],
      default: "pending"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    dueDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // ✅ Embedded Subtasks instead of separate collection
    subtasks: [subtaskSchema]
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", taskSchema);
