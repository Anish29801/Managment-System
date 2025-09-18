import { Schema, model, Document, Types } from "mongoose";

export interface ISearchIndex extends Document {
  taskId?: Types.ObjectId;
  subtaskId?: Types.ObjectId;
  title: string;
  content?: string;
  createdAt: Date;
}

const searchIndexSchema = new Schema<ISearchIndex>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task" },
    subtaskId: { type: Schema.Types.ObjectId, ref: "Subtask" },
    title: { type: String, required: true },
    content: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SearchIndex = model<ISearchIndex>("SearchIndex", searchIndexSchema);
