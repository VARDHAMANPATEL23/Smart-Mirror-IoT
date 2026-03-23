import mongoose, { Schema, Document } from "mongoose";

export interface IMirror extends Document {
  mirrorId: string;      // unique slug, e.g. "rpi-vardhan-01"
  pin: string;           // hashed PIN for RPi login
  ownerId: string;       // references User._id
  layout: object[];      // widget config array (same shape as WidgetData[])
  lastUpdated: Date;
  aiBackendUrl?: string; // dynamically updated by the python server
}

const MirrorSchema: Schema = new Schema({
  mirrorId:     { type: String, required: true, unique: true },
  pin:          { type: String, required: true },
  ownerId:      { type: String, required: true },
  layout:       { type: [Object], default: [] },
  lastUpdated:  { type: Date, default: Date.now },
  aiBackendUrl: { type: String, default: "" },
});

export default mongoose.models.Mirror || mongoose.model<IMirror>("Mirror", MirrorSchema);
