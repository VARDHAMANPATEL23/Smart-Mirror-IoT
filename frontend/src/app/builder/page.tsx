"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Monitor, Layers, Send, Link2, Settings, ChevronLeft } from "lucide-react";
import { Widget } from "@/components/dashboard/Widget";
import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { TasksWidget } from "@/components/widgets/TasksWidget";
import { ProjectTitleWidget } from "@/components/widgets/ProjectTitleWidget";
import { NewsWidget } from "@/components/widgets/NewsWidget";
import { FinanceWidget } from "@/components/widgets/FinanceWidget";

// Mirror dimensions — match page.tsx exactly
const MIRROR_W = 560;
const MIRROR_H = 1080;

interface WidgetData {
  id: string;
  type: string;
  size: "1x1" | "2x1" | "2x2";
  config?: any;
}

const WIDGET_REGISTRY: Record<string, { label: string; render: (c?: any, s?: string) => React.ReactNode }> = {
  project_title: { label: "Project Title", render: () => <ProjectTitleWidget /> },
  clock:         { label: "Clock",         render: () => <ClockWidget /> },
  weather:       { label: "Weather",       render: (c) => <WeatherWidget config={c} /> },
  tasks:         { label: "Tasks",         render: () => <TasksWidget isBuilder={true} /> },
  news:          { label: "Latest News",   render: (c) => <NewsWidget config={c} /> },
  finance:       { label: "Markets",       render: (c, s) => <FinanceWidget config={c} size={s} /> },
};

const SIZE_CLASSES: Record<string, string> = {
  "1x1": "col-span-1 row-span-1",
  "2x1": "col-span-2 row-span-1",
  "2x2": "col-span-2 row-span-2 min-h-[380px]",
};

const SIZE_CYCLE: Record<string, "1x1" | "2x1" | "2x2"> = {
  "1x1": "2x1",
  "2x1": "2x2",
  "2x2": "1x1",
};

// Default widget sizes for quick-add
const DEFAULT_SIZE: Record<string, "1x1" | "2x1" | "2x2"> = {
  weather: "1x1",
  clock: "1x1",
  project_title: "2x1",
  tasks: "2x1",
  news: "2x1",
  finance: "1x1",
};

const initialLayout: WidgetData[] = [
  { id: "title",   type: "project_title", size: "2x1" },
  { id: "clock",   type: "clock",         size: "1x1" },
  { id: "weather", type: "weather",       size: "1x1" },
  { id: "tasks",   type: "tasks",         size: "2x1" },
  { id: "news",    type: "news",          size: "2x1" },
];

// --- Draggable widget inside the WYSIWYG preview ---
function SortablePreviewWidget({
  id, type, size, config, onRemove, onToggleSize, onEdit,
}: {
  id: string; type: string; size: "1x1" | "2x1" | "2x2"; config?: any;
  onRemove: (id: string) => void;
  onToggleSize: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${SIZE_CLASSES[size]}`}
    >
      {/* Overlay controls — only visible on hover */}
      <div className="absolute inset-0 z-10 rounded-lg border border-transparent group-hover:border-cyan-500/60 transition-all pointer-events-none" />
      <div className="absolute top-1 right-1 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing bg-black/70 text-white/60 hover:text-white p-1 rounded"
          style={{ pointerEvents: "all" }}
        >
          <GripVertical size={14} />
        </button>
        <button
          onClick={() => onToggleSize(id)}
          className="bg-black/70 text-cyan-400 hover:text-cyan-300 px-1.5 py-0.5 rounded text-[10px] font-bold"
          style={{ pointerEvents: "all" }}
        >
          {size}
        </button>
        <button
          onClick={() => onEdit(id)}
          className="bg-black/70 text-white/50 hover:text-cyan-400 p-1 rounded transition-colors"
          style={{ pointerEvents: "all" }}
        >
          <Settings size={14} />
        </button>
        <button
          onClick={() => onRemove(id)}
          className="bg-black/70 text-white/50 hover:text-red-400 p-1 rounded"
          style={{ pointerEvents: "all" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Exact same Widget wrapper used in page.tsx */}
      <Widget id={id} title={type}>
        <div className="flex h-full min-h-full flex-col w-full overflow-hidden">
          {WIDGET_REGISTRY[type]?.render(config)}
        </div>
      </Widget>
    </div>
  );
}

// --- Mini widget preview card for the library ---
function WidgetLibraryCard({
  type,
  onAdd,
}: {
  type: string;
  onAdd: () => void;
}) {
  const PREVIEW_W = 200;
  const PREVIEW_H = 100;
  // Scale a 1-col widget cell (260px wide, 180px tall) down to fit the preview card
  const scaleX = PREVIEW_W / 260;
  const scaleY = PREVIEW_H / 180;
  const scale = Math.min(scaleX, scaleY);

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden hover:border-cyan-500/50 transition-all group cursor-pointer" onClick={onAdd}>
      {/* Mini render preview */}
      <div
        className="relative overflow-hidden bg-black"
        style={{ width: PREVIEW_W, height: PREVIEW_H }}
      >
        <div
          style={{
            width: 260,
            height: 180,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            pointerEvents: "none",
          }}
        >
          <Widget id={`preview-${type}`} title={type}>
            <div className="flex h-full min-h-full flex-col w-full overflow-hidden pointer-events-none">
              {WIDGET_REGISTRY[type]?.render()}
            </div>
          </Widget>
        </div>
      </div>

      {/* Label + add button */}
      <div className="px-3 py-2 flex justify-between items-center">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
          {WIDGET_REGISTRY[type]?.label}
        </span>
        <span className="text-xs text-white/40 group-hover:text-cyan-400 transition-colors font-bold">
          + ADD
        </span>
      </div>
    </div>
  );
}

// --- Main Builder Page ---
export default function DisplayBuilder() {
  const [widgets, setWidgets] = useState<WidgetData[]>(initialLayout);
  const [publishing, setPublishing] = useState(false);
  const [mirrorId, setMirrorId] = useState("");
  const [publishResult, setPublishResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [regForm, setRegForm] = useState({ mirrorId: "", pin: "" });
  const [regResult, setRegResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleRemove = (id: string) =>
    setWidgets((curr) => curr.filter((w) => w.id !== id));

  const handleToggleSize = (id: string) =>
    setWidgets((curr) =>
      curr.map((w) => (w.id === id ? { ...w, size: SIZE_CYCLE[w.size] } : w))
    );

  const handleAdd = (type: string) => {
    setWidgets((curr) => [
      ...curr,
      { id: `${type}-${Date.now()}`, type, size: DEFAULT_SIZE[type] ?? "2x1", config: type === 'finance' ? { tickers: 'BTC-USD,AAPL' } : undefined },
    ]);
  };

  const handleUpdateConfig = (id: string, newConfig: any) => {
    setWidgets((curr) => curr.map((w) => w.id === id ? { ...w, config: newConfig } : w));
  };

  const handleRegisterMirror = async () => {
    if (!regForm.mirrorId.trim() || !regForm.pin.trim()) {
      setRegResult({ ok: false, msg: "Fill both fields" });
      return;
    }
    setRegLoading(true);
    setRegResult(null);
    try {
      const res = await fetch("/api/mirror/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mirrorId: regForm.mirrorId.trim(), pin: regForm.pin.trim() }),
      });
      const data = await res.json();
      setRegResult({ ok: res.ok, msg: res.ok ? `Mirror "${regForm.mirrorId}" registered` : data.message });
    } catch {
      setRegResult({ ok: false, msg: "Network error" });
    } finally {
      setRegLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!mirrorId.trim()) {
      setPublishResult({ ok: false, msg: "Enter a Mirror ID first" });
      return;
    }
    setPublishing(true);
    setPublishResult(null);
    try {
      const res = await fetch("/api/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mirrorId: mirrorId.trim(), layout: widgets }),
      });
      const data = await res.json();
      setPublishResult({ ok: res.ok, msg: res.ok ? "Published to mirror" : data.message });
    } catch {
      setPublishResult({ ok: false, msg: "Network error" });
    } finally {
      setPublishing(false);
    }
  };

  // Scale the 560×1080 mirror to fit inside a viewport-friendly height
  // Target display height: calc(100vh - header - padding) ≈ 85vh
  const displayH = typeof window !== "undefined" ? window.innerHeight * 0.82 : 820;
  const mirrorScale = Math.min(displayH / MIRROR_H, 1);
  const scaledW = MIRROR_W * mirrorScale;
  const scaledH = MIRROR_H * mirrorScale;

  return (
    <div className="h-screen bg-neutral-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-none flex items-center justify-between px-8 py-4 border-b border-white/10 bg-neutral-950/80 backdrop-blur-sm z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-cyan-400">DISPLAY BUILDER</h1>
          <p className="text-white/40 text-xs mt-0.5 tracking-wide">WYSIWYG — 1:1 mirror preview</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30">
          <Monitor size={14} />
          <span>{MIRROR_W} × {MIRROR_H}px</span>
          <span className="text-white/10">|</span>
          <span>Scale {(mirrorScale * 100).toFixed(0)}%</span>
        </div>
      </header>

      {/* Body: 3-panel */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Widget Library */}
        <aside className="w-[240px] flex-none border-r border-white/10 bg-neutral-900 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={14} className="text-cyan-500" />
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Widget Library</span>
          </div>
          <p className="text-[11px] text-white/30 italic -mt-2 mb-2">Click a widget to add it</p>
          {Object.keys(WIDGET_REGISTRY).map((type) => (
            <WidgetLibraryCard key={type} type={type} onAdd={() => handleAdd(type)} />
          ))}
        </aside>

        {/* Center: WYSIWYG Mirror Preview */}
        <main className="flex-1 flex flex-col items-center justify-center bg-neutral-950 overflow-hidden p-6">
          <div className="text-[11px] text-white/30 uppercase tracking-widest mb-3">
            Mirror Simulator — Drag to reorder, hover to resize / remove
          </div>

          {/* Scaled mirror container */}
          <div style={{ width: scaledW, height: scaledH, position: "relative" }}>
            <div
              style={{
                width: MIRROR_W,
                height: MIRROR_H,
                transform: `scale(${mirrorScale})`,
                transformOrigin: "top left",
              }}
              className="bg-black border border-white/10 shadow-[0_0_60px_rgba(0,200,255,0.05)] overflow-hidden"
            >
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                {/* Exact same grid as page.tsx */}
                <div className="p-8 grid grid-cols-2 grid-rows-[repeat(auto-fill,minmax(180px,1fr))] auto-rows-[180px] gap-6 w-full h-full content-start">
                  <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
                    {widgets.map((widget) => (
                      <SortablePreviewWidget
                        key={widget.id}
                        id={widget.id}
                        type={widget.type}
                        size={widget.size}
                        config={widget.config}
                        onRemove={handleRemove}
                        onToggleSize={handleToggleSize}
                        onEdit={setEditingConfigId}
                      />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>
            </div>
          </div>
        </main>

        {/* Right: Publish Panel */}
        <aside className="w-[200px] flex-none border-l border-white/10 bg-neutral-900 flex flex-col p-5 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Send size={14} className="text-cyan-500" />
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Publish</span>
            </div>
            <div className="mb-3">
              <label className="text-[10px] text-white/30 uppercase tracking-widest block mb-1">Mirror ID</label>
              <input
                type="text"
                placeholder="rpi-vardhan-01"
                value={mirrorId}
                onChange={(e) => setMirrorId(e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-cyan-500 rounded-lg px-3 py-2 text-white text-xs font-mono placeholder-white/20 focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm tracking-wide"
            >
              {publishing ? "PUBLISHING..." : "PUBLISH LAYOUT"}
            </button>
            {publishResult && (
              <p className={`text-[11px] mt-2 text-center ${publishResult.ok ? "text-cyan-400" : "text-red-400"}`}>
                {publishResult.msg}
              </p>
            )}
          </div>

          {editingConfigId ? (
            <div className="border-t border-white/10 pt-4 relative">
              <button onClick={() => setEditingConfigId(null)} className="flex items-center gap-1 text-[10px] text-cyan-500 hover:text-cyan-400 uppercase tracking-widest mb-3" >
                <ChevronLeft size={12} /> BACK
              </button>
              <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest mb-3">Widget Configuration</p>
              {(() => {
                const w = widgets.find((x) => x.id === editingConfigId);
                if (!w) return <p className="text-xs text-white/50">Widget not found</p>;
                if (w.type === "finance") {
                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-widest block mb-1">Stock / Crypto Tickers</label>
                        <input
                          type="text"
                          value={w.config?.tickers || ""}
                          onChange={(e) => handleUpdateConfig(w.id, { ...w.config, tickers: e.target.value })}
                          placeholder="BTC-USD,ETH-USD,AAPL"
                          className="w-full bg-black/40 border border-white/10 focus:border-cyan-500 rounded px-2 py-1.5 text-white text-xs font-mono placeholder-white/20 focus:outline-none transition-colors"
                        />
                        <p className="text-[9px] text-white/30 mt-1 leading-tight tracking-wide">Comma-separated ticker symbols.</p>
                      </div>
                    </div>
                  );
                }
                if (w.type === "weather") {
                  return (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] text-white/30 uppercase tracking-widest">Location Config</label>
                          <button 
                            className="text-[9px] text-cyan-500 hover:text-cyan-400 uppercase tracking-widest font-bold border border-cyan-500/30 px-1.5 rounded bg-cyan-500/10"
                            onClick={() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                  (pos) => handleUpdateConfig(w.id, { ...w.config, lat: pos.coords.latitude.toFixed(4), lon: pos.coords.longitude.toFixed(4) }),
                                  (err) => alert("Location access denied or failed.")
                                );
                              }
                            }}
                          >
                            Use My IP
                          </button>
                        </div>
                        <select
                          className="w-full bg-black/40 border border-white/10 focus:border-cyan-500 rounded px-2 py-1.5 text-white text-[11px] font-mono focus:outline-none transition-colors mb-2"
                          value={`${w.config?.lat || "40.7128"},${w.config?.lon || "-74.0060"}`}
                          onChange={(e) => {
                            const [lat, lon] = e.target.value.split(",");
                            handleUpdateConfig(w.id, { ...w.config, lat, lon });
                          }}
                        >
                          <option value="40.7128,-74.0060">Custom / Selected</option>
                          <option value="19.0760,72.8777">Mumbai, IND</option>
                          <option value="21.1702,72.8311">Surat, IND</option>
                          <option value="21.1194,73.1166">Bardoli, IND</option>
                          <option value="22.5726,88.3639">Kolkata, IND</option>
                        </select>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input type="text" placeholder="Lat" value={w.config?.lat || "40.7128"} onChange={(e) => handleUpdateConfig(w.id, { ...w.config, lat: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-[10px] font-mono" />
                          </div>
                          <div className="flex-1">
                            <input type="text" placeholder="Lon" value={w.config?.lon || "-74.0060"} onChange={(e) => handleUpdateConfig(w.id, { ...w.config, lon: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-[10px] font-mono" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-widest block mb-1">Temperature Unit</label>
                        <select
                          className="w-full bg-black/40 border border-white/10 focus:border-cyan-500 rounded px-2 py-1 text-white text-[11px] font-mono focus:outline-none transition-colors"
                          value={w.config?.unit || "celsius"}
                          onChange={(e) => handleUpdateConfig(w.id, { ...w.config, unit: e.target.value })}
                        >
                          <option value="celsius">Celsius (°C)</option>
                          <option value="fahrenheit">Fahrenheit (°F)</option>
                        </select>
                      </div>
                    </div>
                  );
                }
                if (w?.type === "news") {
                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-white/30 uppercase tracking-widest block mb-1">News Providers</label>
                        <select
                          multiple
                          className="w-full bg-black/40 border border-white/10 focus:border-cyan-500 rounded px-2 py-1 text-white text-[11px] font-mono focus:outline-none transition-colors h-24"
                          value={w!.config?.providers ? w!.config.providers.split(',') : ["global","national","local"]}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value).join(',');
                            handleUpdateConfig(w!.id, { ...w!.config, providers: selected });
                          }}
                        >
                          <option value="global">Global (BBC)</option>
                          <option value="national">National (US/NYT)</option>
                          <option value="uk">UK National (BBC)</option>
                          <option value="local">Local (NY Region)</option>
                          <option value="tech">Technology</option>
                          <option value="business">Business</option>
                        </select>
                        <p className="text-[9px] text-white/30 mt-1 leading-tight tracking-wide">Hold Ctrl/Cmd to select multiple regions or segments.</p>
                      </div>
                    </div>
                  );
                }
                return <p className="text-[10px] text-white/50">No settings available for {WIDGET_REGISTRY[w.type]?.label}.</p>;
              })()}
            </div>
          ) : (
            <div className="border-t border-white/10 pt-4">
              <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest mb-2">Active Widgets</p>
              <div className="space-y-1">
                {widgets.map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-[11px] group">
                    <span className="text-white/50 truncate cursor-pointer hover:text-white transition-colors" onClick={() => setEditingConfigId(w.id)}>
                      {WIDGET_REGISTRY[w.type]?.label}
                    </span>
                    <span className="text-cyan-600 font-bold ml-1">{w.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Register Mirror */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={13} className="text-cyan-700" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Register Mirror</span>
            </div>
            <input
              type="text"
              placeholder="Mirror ID"
              value={regForm.mirrorId}
              onChange={(e) => setRegForm((f) => ({ ...f, mirrorId: e.target.value }))}
              className="w-full mb-2 bg-black/40 border border-white/10 focus:border-cyan-700 rounded px-2 py-1.5 text-white text-xs font-mono placeholder-white/20 focus:outline-none transition-colors"
            />
            <input
              type="password"
              placeholder="PIN"
              value={regForm.pin}
              onChange={(e) => setRegForm((f) => ({ ...f, pin: e.target.value }))}
              className="w-full mb-2 bg-black/40 border border-white/10 focus:border-cyan-700 rounded px-2 py-1.5 text-white text-xs placeholder-white/20 focus:outline-none transition-colors"
            />
            <button
              onClick={handleRegisterMirror}
              disabled={regLoading}
              className="w-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white/70 font-bold py-2 rounded text-xs tracking-wide transition-colors"
            >
              {regLoading ? "REGISTERING..." : "REGISTER"}
            </button>
            {regResult && (
              <p className={`text-[10px] mt-1.5 text-center ${regResult.ok ? "text-cyan-500" : "text-red-400"}`}>
                {regResult.msg}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
