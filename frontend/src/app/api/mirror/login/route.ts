import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Mirror from "@/models/Mirror";
import bcrypt from "bcryptjs";

// POST /api/mirror/login — validates mirrorId + PIN
// Returns mirrorId on success; frontend stores it in localStorage
export async function POST(req: NextRequest) {
  const { mirrorId, pin } = await req.json();
  if (!mirrorId || !pin)
    return NextResponse.json({ message: "mirrorId and pin required" }, { status: 400 });

  await dbConnect();
  const mirror = await Mirror.findOne({ mirrorId });
  if (!mirror)
    return NextResponse.json({ message: "Mirror not found" }, { status: 404 });

  const match = await bcrypt.compare(pin, mirror.pin);
  if (!match)
    return NextResponse.json({ message: "Invalid PIN" }, { status: 401 });

  return NextResponse.json({ mirrorId: mirror.mirrorId });
}
