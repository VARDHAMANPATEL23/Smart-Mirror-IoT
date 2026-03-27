"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Widget } from "@/components/dashboard/Widget";
import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { TasksWidget } from "@/components/widgets/TasksWidget";
import { ProjectTitleWidget } from "@/components/widgets/ProjectTitleWidget";
import { NewsWidget } from "@/components/widgets/NewsWidget";
import { FinanceWidget } from "@/components/widgets/FinanceWidget";

interface WidgetData {
  id: string;
  type: string;
  size: "1x1" | "2x1" | "2x2";
  config?: any;
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
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const WIDGET_REGISTRY = useMemo(() => ({
    project_title: (config?: any, size?: string) => <ProjectTitleWidget />,
    clock:         (config?: any, size?: string) => <ClockWidget />,
    weather:       (config?: any, size?: string) => <WeatherWidget config={config} />,
    tasks:         (config?: any, size?: string) => <TasksWidget mirrorId={mirrorId} />,
    news:          (config?: any, size?: string) => <NewsWidget config={config} />,
    finance:       (config?: any, size?: string) => <FinanceWidget config={config} size={size} />,
  }), [mirrorId]);

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
    <div className="min-h-screen w-full h-full bg-black relative overflow-hidden">
      {/* Connection indicator */}
      <div className="absolute top-3 right-4 flex items-center gap-2 z-10">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-cyan-400 animate-pulse" : "bg-red-500"}`} />
        <span className="text-[10px] text-white/20 font-mono">
          {connected ? mirrorId : error || "connecting..."}
        </span>
      </div>

      {/* Exact same 560×1080 container, absolutely tethered to top-right with 2rem padding */}
      <div
        className="absolute top-8 right-8 bg-black text-white overflow-hidden p-8 border border-white/5 rounded-3xl shadow-2xl"
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
                    {(WIDGET_REGISTRY as any)[widget.type]?.(widget.config, widget.size)}
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
