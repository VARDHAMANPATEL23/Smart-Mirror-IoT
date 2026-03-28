import mongoose, { Schema, Document } from "mongoose";

export interface IMirror extends Document {
  mirrorId: string;      // unique slug, e.g. "rpi-vardhan-01"
  pin: string;           // hashed PIN for RPi login
  ownerId: string;       // references User._id
  layout: object[];      // widget config array (same shape as WidgetData[])
  alignment: string;     // "top-right", "top-left", etc
  lastUpdated: Date;
}

const MirrorSchema: Schema = new Schema({
  mirrorId:    { type: String, required: true, unique: true },
  pin:         { type: String, required: true },
  ownerId:     { type: String, required: true },
  layout:      { type: [Object], default: [] },
  alignment:   { type: String, default: "top-right" },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.models.Mirror || mongoose.model<IMirror>("Mirror", MirrorSchema);
