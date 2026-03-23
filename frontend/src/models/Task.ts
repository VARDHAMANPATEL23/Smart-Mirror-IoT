import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  text: string;
  completed: boolean;
  ownerId: string;    // references User._id
  createdAt: Date;
}

const TaskSchema: Schema = new Schema({
  text:      { type: String, required: true },
  completed: { type: Boolean, default: false },
  ownerId:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
