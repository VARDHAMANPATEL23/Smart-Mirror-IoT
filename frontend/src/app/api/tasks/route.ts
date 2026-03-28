import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";
import Mirror from "@/models/Mirror";

// GET /api/tasks?mirrorId=xxx — Fetches tasks for specified owner or mirror context
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const mirrorId = req.nextUrl.searchParams.get("mirrorId");

  await dbConnect();

  let ownerId = (session?.user as any)?.id;

  // If mirrorId is provided (from the mirror display), find the owner
  if (!ownerId && mirrorId) {
    const mirror = await Mirror.findOne({ mirrorId });
    if (mirror) ownerId = mirror.ownerId;
  }

  if (!ownerId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const tasks = await Task.find({ ownerId }).sort({ createdAt: -1 });
  return NextResponse.json(tasks);
}


// POST /api/tasks — Adds a new task
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text) return NextResponse.json({ message: "Text required" }, { status: 400 });

  await dbConnect();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const task = await Task.create({
    text,
    ownerId: (session.user as any).id,
  });

  return NextResponse.json(task, { status: 201 });
}

// DELETE /api/tasks?id=xxx — Deletes a task
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const taskId = req.nextUrl.searchParams.get("id");
  if (!taskId) return NextResponse.json({ message: "ID required" }, { status: 400 });

  await dbConnect();
  await Task.deleteOne({ _id: taskId, ownerId: (session.user as any).id });

  return NextResponse.json({ message: "Task deleted" });
}
