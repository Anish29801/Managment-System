import { Schema, model} from "mongoose";
import { IActivity } from "../types";


const activitySchema = new Schema<IActivity>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    oldValue: { type: String },
    newValue: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Activity = model<IActivity>("Activity", activitySchema);
