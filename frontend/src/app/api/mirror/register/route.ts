import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Mirror from "@/models/Mirror";
import bcrypt from "bcryptjs";

// POST /api/mirror/register — create a new mirror bound to the logged-in user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { mirrorId, pin } = await req.json();
  if (!mirrorId || !pin)
    return NextResponse.json({ message: "mirrorId and pin required" }, { status: 400 });

  await dbConnect();

  const existing = await Mirror.findOne({ mirrorId });
  if (existing)
    return NextResponse.json({ message: "Mirror ID already taken" }, { status: 409 });

  const hashedPin = await bcrypt.hash(pin, 10);
  const mirror = await Mirror.create({
    mirrorId,
    pin: hashedPin,
    ownerId: (session.user as any).id,
    layout: [],
  });

  return NextResponse.json({ message: "Mirror registered", mirrorId: mirror.mirrorId }, { status: 201 });
}
