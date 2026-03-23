"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Widget } from "@/components/dashboard/Widget";
import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { TasksWidget } from "@/components/widgets/TasksWidget";
import { AiContentWidget } from "@/components/widgets/AiContentWidget";
import { VoiceTranscriptWidget } from "@/components/widgets/VoiceTranscriptWidget";
import { ProjectTitleWidget } from "@/components/widgets/ProjectTitleWidget";
import { NewsWidget } from "@/components/widgets/NewsWidget";

interface WidgetData {
  id: string;
  type: string;
  size: "1x1" | "2x1" | "2x2";
}

const SIZE_CLASSES: Record<string, string> = {
  "1x1": "col-span-1 row-span-1",
  "2x1": "col-span-2 row-span-1",
  "2x2": "col-span-2 row-span-2 min-h-[300px]",
};

export default function MirrorDisplay() {
  const { mirrorId } = useParams<{ mirrorId: string }>();
  const router = useRouter();
  const [widgets, setWidgets] = useState<WidgetData[]>([]);
  const [aiBackendUrl, setAiBackendUrl] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const WIDGET_REGISTRY = useMemo(() => ({
    project_title: <ProjectTitleWidget />,
    clock:         <ClockWidget />,
    weather:       <WeatherWidget />,
    tasks:         <TasksWidget mirrorId={mirrorId} />,
    ai:            <AiContentWidget mirrorId={mirrorId} aiBackendUrl={aiBackendUrl} />,
    voice:         <VoiceTranscriptWidget />,
    news:          <NewsWidget />,
  }), [mirrorId, aiBackendUrl]);

  useEffect(() => {
    // Guard: if not authenticated, redirect to rpi-login
    const stored = localStorage.getItem("rpiMirrorId");
    if (!stored || stored !== mirrorId) {
      router.replace("/rpi-login");
      return;
    }

    // Open SSE connection
    const es = new EventSource(`/api/mirror/${mirrorId}/events`);

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.layout) setWidgets(data.layout);
        if (data.aiBackendUrl) setAiBackendUrl(data.aiBackendUrl);
      } catch {
        // ignore malformed messages
      }
    };

    es.onerror = () => {
      setConnected(false);
      setError("Connection lost — retrying...");
    };

    return () => es.close();
  }, [mirrorId, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative">
      {/* Connection indicator */}
      <div className="absolute top-3 right-4 flex items-center gap-2 z-10">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-cyan-400 animate-pulse" : "bg-red-500"}`} />
        <span className="text-[10px] text-white/20 font-mono">
          {connected ? mirrorId : error || "connecting..."}
        </span>
      </div>

      {/* Exact same 560×1080 container as page.tsx */}
      <div
        className="relative bg-black text-white overflow-hidden p-8 border border-white/5"
        style={{ width: "560px", height: "1080px" }}
      >
        {widgets.length === 0 ? (
          <div className="flex h-full items-center justify-center text-white/20 text-sm tracking-widest">
            WAITING FOR LAYOUT...
          </div>
        ) : (
          <div className="grid grid-cols-2 grid-rows-[repeat(auto-fill,minmax(140px,1fr))] auto-rows-[140px] gap-4 w-full h-full">
            {widgets.map((widget) => (
              <div key={widget.id} className={SIZE_CLASSES[widget.size]}>
                <Widget id={widget.id} title={widget.type}>
                  <div className="flex h-full min-h-full flex-col w-full overflow-hidden">
                    {(WIDGET_REGISTRY as any)[widget.type]}
                  </div>
                </Widget>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
