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
import { GripVertical, X } from "lucide-react";
import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { TasksWidget } from "@/components/widgets/TasksWidget";
import { AiContentWidget } from "@/components/widgets/AiContentWidget";
import { VoiceTranscriptWidget } from "@/components/widgets/VoiceTranscriptWidget";
import { ProjectTitleWidget } from "@/components/widgets/ProjectTitleWidget";

interface WidgetData {
  id: string;
  type: string;
  size: "1x1" | "2x1" | "2x2";
}

const WIDGET_REGISTRY: Record<string, React.ReactNode> = {
  project_title: <ProjectTitleWidget />,
  clock: <ClockWidget />,
  weather: <WeatherWidget />,
  tasks: <TasksWidget />,
  ai: <AiContentWidget />,
  voice: <VoiceTranscriptWidget />,
};

const initialLayout: WidgetData[] = [
  { id: "title", type: "project_title", size: "2x1" },
  { id: "clock", type: "clock", size: "1x1" },
  { id: "weather", type: "weather", size: "1x1" },
  { id: "tasks", type: "tasks", size: "2x1" },
  { id: "ai", type: "ai", size: "2x2" },
  { id: "voice", type: "voice", size: "2x1" },
];

function SortableBuilderWidget({
  id,
  type,
  size,
  onRemove,
  onToggleSize,
}: {
  id: string;
  type: string;
  size: "1x1" | "2x1" | "2x2";
  onRemove: (id: string) => void;
  onToggleSize: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const sizeClasses = {
    "1x1": "col-span-1 row-span-1",
    "2x1": "col-span-2 row-span-1",
    "2x2": "col-span-2 row-span-2 min-h-[300px]",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col rounded-2xl border border-white/20 bg-black/60 p-4 backdrop-blur-md shadow-lg group ${
        isDragging
          ? "shadow-[0_0_15px_rgba(255,255,255,0.3)] ring-2 ring-cyan-400"
          : ""
      } ${sizeClasses[size]}`}
    >
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          {...attributes}
          {...listeners}
          className="text-white/50 hover:text-white cursor-grab active:cursor-grabbing bg-black/50 p-1 rounded-md"
        >
          <GripVertical size={20} />
        </button>
        <button
          onClick={() => onToggleSize(id)}
          className="text-white hover:text-cyan-400 bg-black border border-white/10 px-2 py-1 rounded-md transition-colors text-xs font-bold"
          aria-label="Toggle size"
        >
          {size}
        </button>
        <button
          onClick={() => onRemove(id)}
          className="text-white/50 hover:text-red-400 bg-black/50 p-1 rounded-md transition-colors"
          aria-label="Remove widget"
        >
          <X size={20} />
        </button>
      </div>
      <div className="w-full text-xs text-cyan-500 mb-2 uppercase tracking-wider font-bold opacity-70">
        {type.replace("_", " ")}
      </div>
      <div className="flex-1 pointer-events-none">
        {WIDGET_REGISTRY[type] || (
          <div className="text-red-500">Unknown Widget</div>
        )}
      </div>
    </div>
  );
}

export default function DisplayBuilder() {
  const [widgets, setWidgets] = useState<WidgetData[]>(initialLayout);
  const [publishing, setPublishing] = useState(false);

  const handleRemoveWidget = (idToRemove: string) => {
    setWidgets((current) => current.filter((w) => w.id !== idToRemove));
  };

  const handleToggleSize = (idToToggle: string) => {
    setWidgets((current) =>
      current.map((w) => {
        if (w.id !== idToToggle) return w;
        const nextSize =
          w.size === "1x1" ? "2x1" : w.size === "2x1" ? "2x2" : "1x1";
        return { ...w, size: nextSize };
      }),
    );
  };

  const handleAddWidget = (type: string) => {
    const newId = `${type}-${Date.now()}`;
    const defaultSize =
      type === "ai"
        ? "2x2"
        : type === "weather" || type === "clock"
          ? "1x1"
          : "2x1";
    setWidgets((current) => [
      ...current,
      { id: newId, type, size: defaultSize as any },
    ]);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handlePublish = async () => {
    setPublishing(true);
    // In the future, this will send an API request to save to MongoDB
    console.log("Publishing Layout:", widgets);
    setTimeout(() => {
      alert("Layout Published to your Smart Mirror!");
      setPublishing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8 flex flex-col items-center">
      <header className="mb-8 w-full max-w-5xl flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-cyan-400">
            DISPLAY BUILDER
          </h1>
          <p className="text-white/50 mt-1">Configure your mirror layout</p>
        </div>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded transition-colors"
        >
          {publishing ? "PUBLISHING..." : "PUBLISH LAYOUT"}
        </button>
      </header>

      <div className="w-full max-w-5xl flex gap-12 justify-center">
        {/* Mirror Preview Area */}
        <div className="flex flex-col items-center">
          <div className="text-sm text-white/40 mb-2 tracking-widest uppercase">
            Mirror Simulator (560x1080)
          </div>
          <div
            className="relative bg-black border-8 border-neutral-800 rounded-xl overflow-hidden shadow-2xl"
            style={{ width: "560px", height: "1080px" }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="p-8 grid grid-cols-2 grid-rows-[repeat(auto-fill,minmax(140px,1fr))] auto-rows-[140px] gap-4 h-full content-start">
                <SortableContext
                  items={widgets.map((w) => w.id)}
                  strategy={rectSortingStrategy}
                >
                  {widgets.map((widget) => (
                    <SortableBuilderWidget
                      key={widget.id}
                      id={widget.id}
                      type={widget.type}
                      size={widget.size}
                      onRemove={handleRemoveWidget}
                      onToggleSize={handleToggleSize}
                    />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          </div>
        </div>

        {/* Widget Library Panel */}
        <div className="w-64">
          <div className="bg-neutral-800 p-6 rounded-xl border border-white/5">
            <h2 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">
              Widgets Library
            </h2>
            <div className="text-sm text-white/50 italic mb-6">
              Click widgets to add them
            </div>
            <div className="space-y-4">
              {Object.keys(WIDGET_REGISTRY).map((type) => (
                <button
                  key={type}
                  onClick={() => handleAddWidget(type)}
                  className="w-full text-left p-3 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-cyan-500/50 rounded-lg text-cyan-400 cursor-pointer opacity-80 hover:opacity-100 transition-all font-bold tracking-wide"
                >
                  + {type.replace("_", " ").toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
