import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";
import Mirror from "../src/models/Mirror";
import { parse } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

async function seed() {
  console.log("Loading environment variables from .env.local...");
  const envConfig = parse(readFileSync(join(process.cwd(), ".env.local")));
  const MONGODB_URI = envConfig.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing from .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  const demoUser = {
    name: "Demo Admin",
    email: "admin@mirror.iot",
    password: "Password123!",
  };

  const demoMirror = {
    mirrorId: "rpi-demo-01",
    pin: "123456",
  };

  try {
    // 1. Check if user already exists
    let user = await User.findOne({ email: demoUser.email });
    if (!user) {
      console.log(`Creating user: ${demoUser.email}...`);
      const hashedPassword = await bcrypt.hash(demoUser.password, 10);
      user = await User.create({
        name: demoUser.name,
        email: demoUser.email,
        password: hashedPassword,
      });
      console.log(`✅ User created (ID: ${user._id})`);
    } else {
      console.log(`⚠️ User ${demoUser.email} already exists.`);
    }

    const defaultLayout = [
      { id: "title", type: "project_title", size: "2x1" },
      { id: "clock", type: "clock", size: "1x1" },
      { id: "weather", type: "weather", size: "1x1" },
      { id: "news", type: "news", size: "2x1" },
    ];

    let mirror = await Mirror.findOne({ mirrorId: demoMirror.mirrorId });
    if (!mirror) {
      console.log(`Registering mirror: ${demoMirror.mirrorId}...`);
      const hashedPin = await bcrypt.hash(demoMirror.pin, 10);
      
      mirror = await Mirror.create({
        mirrorId: demoMirror.mirrorId,
        pin: hashedPin,
        ownerId: user._id.toString(),
        layout: defaultLayout,
      });
      console.log(`✅ Mirror registered (ID: ${mirror.mirrorId})`);
    } else {
      console.log(`⚠️ Mirror ${demoMirror.mirrorId} already registered. Updating layout...`);
      mirror = await Mirror.findOneAndUpdate(
        { mirrorId: demoMirror.mirrorId },
        { layout: defaultLayout },
        { new: true }
      );
      console.log(`✅ Layout updated with News RSS Feed.`);
    }

  } catch (err) {
    console.error("❌ Seed Error:", err);
  } finally {
    console.log("Disconnecting from database...");
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
