import { NextRequest, NextResponse } from "next/server";
import { emailEventEmitter, ensureEmailListener } from "@/lib/emailListener";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Mirror from "@/models/Mirror";

/**
 * SSE Route for real-time email updates.
 * Credentials are NEVER accepted in the URL — resolved server-side only.
 * Usage: GET /api/email/stream (session-based) or GET /api/email/stream?mirrorId=... (mirror-based)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mirrorId = searchParams.get("mirrorId");

  await dbConnect();

  let email: string | null = null;
  let pass: string | null = null;

  // Resolve via user session (browser/builder)
  const session = await getServerSession(authOptions);
  if (session) {
    const user = await User.findOne({ email: session.user?.email });
    email = user?.serviceEmail || null;
    pass = user?.serviceAppPassword || null;
  }

  // Resolve via mirror ownership (RPi unauthenticated)
  if ((!email || !pass) && mirrorId) {
    const mirror = await Mirror.findOne({ mirrorId });
    if (mirror?.ownerId) {
      const owner = await User.findById(mirror.ownerId);
      email = owner?.serviceEmail || null;
      pass = owner?.serviceAppPassword || null;
    }
  }

  if (!email || !pass) {
    return new Response("Could not resolve email credentials", { status: 401 });
  }

  await ensureEmailListener(email, pass);

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const onMail = (newMail: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(newMail)}\n\n`));
      };

      emailEventEmitter.on(`mail:${email}`, onMail);

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 20000);

      req.signal.addEventListener("abort", () => {
        emailEventEmitter.off(`mail:${email}`, onMail);
        clearInterval(heartbeat);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
