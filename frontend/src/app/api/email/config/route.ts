import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Mirror from "@/models/Mirror";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mirrorId = searchParams.get("mirrorId");
  const session = await getServerSession(authOptions);
  
  await dbConnect();

  let user = null;

  if (session) {
    user = await User.findOne({ email: session.user?.email });
  } else if (mirrorId) {
    const mirror = await Mirror.findOne({ mirrorId: mirrorId });
    if (mirror?.ownerId) {
      user = await User.findById(mirror.ownerId);
    }
  }

  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  
  return NextResponse.json({ 
    serviceEmail: user.serviceEmail || "",
    serviceAppPassword: user.serviceAppPassword ? "********" : ""
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { serviceEmail, serviceAppPassword } = await req.json();
  
  await dbConnect();
  await User.findOneAndUpdate(
    { email: session.user?.email },
    { serviceEmail, serviceAppPassword },
    { upsert: true }
  );

  return NextResponse.json({ message: "Credentials saved." });
}
