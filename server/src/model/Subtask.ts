import { Schema, model} from "mongoose";
import { ISubtask } from "../types";

const subtaskSchema = new Schema<ISubtask>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" }
  },
  { timestamps: true }
);

export const Subtask = model<ISubtask>("Subtask", subtaskSchema);
