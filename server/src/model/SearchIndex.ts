import { Schema, model} from "mongoose";
import { ISearchIndex } from "../types";


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
