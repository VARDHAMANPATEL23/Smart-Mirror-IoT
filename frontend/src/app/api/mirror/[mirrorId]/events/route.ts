import { NextRequest } from "next/server";
import { layoutEventEmitter } from "@/lib/layoutEvents";
import dbConnect from "@/lib/mongodb";
import Mirror from "@/models/Mirror";

// GET /api/mirror/[mirrorId]/events — SSE stream used by RPi display page
export async function GET(
  req: NextRequest,
  { params }: { params: { mirrorId: string } }
) {
  const { mirrorId } = params;

  await dbConnect();
  const mirror = await Mirror.findOne({ mirrorId });
  if (!mirror) {
    return new Response("Mirror not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send current layout immediately on connect
      const initial = `data: ${JSON.stringify({ layout: mirror.layout })}\n\n`;
      controller.enqueue(encoder.encode(initial));

      // Push updates whenever the layout is published
      const onUpdate = (updatedMirror: any) => {
        const msg = `data: ${JSON.stringify({ layout: updatedMirror.layout })}\n\n`;
        controller.enqueue(encoder.encode(msg));
      };

      layoutEventEmitter.on(mirrorId, onUpdate);

      // Clean up on client disconnect
      req.signal.addEventListener("abort", () => {
        layoutEventEmitter.off(mirrorId, onUpdate);
        controller.close();
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
