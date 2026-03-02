import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    email: string;
    password?: string;
    name?: string;
    dashboardConfig?: object;
    preferredPersona?: string;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    name: { type: String, required: false },
    dashboardConfig: { type: Object, default: {} },
    preferredPersona: { type: String, default: 'default' },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
