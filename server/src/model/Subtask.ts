import { Schema, model, Document, Types } from "mongoose";

export interface ISubtask extends Document {
  taskId: Types.ObjectId;
  title: string;
  status: "pending" | "inprogress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const subtaskSchema = new Schema<ISubtask>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" }
  },
  { timestamps: true }
);

export const Subtask = model<ISubtask>("Subtask", subtaskSchema);
