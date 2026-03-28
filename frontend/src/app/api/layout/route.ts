import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Mirror from "@/models/Mirror";
import { layoutEventEmitter } from "@/lib/layoutEvents";

// GET /api/layout?mirrorId=xxx  — fetch current layout
export async function GET(req: NextRequest) {
  const mirrorId = req.nextUrl.searchParams.get("mirrorId");
  if (!mirrorId)
    return NextResponse.json({ message: "mirrorId required" }, { status: 400 });

  await dbConnect();
  const mirror = await Mirror.findOne({ mirrorId });
  if (!mirror)
    return NextResponse.json({ message: "Mirror not found" }, { status: 404 });

  return NextResponse.json({ layout: mirror.layout, alignment: mirror.alignment });
}

// POST /api/layout  — publish new layout (requires user session)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { mirrorId, layout, alignment } = await req.json();
  if (!mirrorId || !layout)
    return NextResponse.json({ message: "mirrorId and layout required" }, { status: 400 });

  await dbConnect();
  const mirror = await Mirror.findOneAndUpdate(
    { mirrorId, ownerId: (session.user as any).id },
    { layout, alignment, lastUpdated: new Date() },
    { new: true }
  );

  if (!mirror)
    return NextResponse.json({ message: "Mirror not found or not owned by you" }, { status: 404 });

  // Notify SSE listeners for this mirrorId with full mirror object
  layoutEventEmitter.emit(mirrorId, mirror);

  return NextResponse.json({ message: "Layout published", layout: mirror.layout });
}
