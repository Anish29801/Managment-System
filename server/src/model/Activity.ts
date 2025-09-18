import { Schema, model, Document, Types } from "mongoose";

export interface IActivity extends Document {
  taskId: Types.ObjectId;
  userId: Types.ObjectId;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

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
