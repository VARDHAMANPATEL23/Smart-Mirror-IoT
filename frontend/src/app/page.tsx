"use client";

import { useState } from "react";
import { Widget } from "@/components/dashboard/Widget";
import { ClockWidget } from "@/components/widgets/ClockWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { TasksWidget } from "@/components/widgets/TasksWidget";
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
};

// In the future, this config will be fetched from MongoDB
const userLayoutConfig: WidgetData[] = [
  { id: "title", type: "project_title", size: "2x1" },
  { id: "clock", type: "clock", size: "1x1" },
  { id: "weather", type: "weather", size: "1x1" },
  { id: "tasks", type: "tasks", size: "2x1" },
];

export default function Dashboard() {
  const [widgets] = useState<WidgetData[]>(userLayoutConfig);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Mirror View Container: Strictly 560x1080 */}
      <div
        className="relative bg-black text-white overflow-hidden p-8 border border-white/5"
        style={{ width: "560px", height: "1080px" }}
      >
        <div className="grid grid-cols-2 grid-rows-[repeat(auto-fill,minmax(140px,1fr))] auto-rows-[140px] gap-4 w-full h-full">
          {widgets.map((widget) => {
            const sizeClasses = {
              "1x1": "col-span-1 row-span-1",
              "2x1": "col-span-2 row-span-1",
              "2x2": "col-span-2 row-span-2 min-h-[300px]",
            };

            return (
              <div key={widget.id} className={sizeClasses[widget.size]}>
                <Widget id={widget.id} title={widget.type}>
                  <div className="flex h-full min-h-full flex-col w-full overflow-hidden">
                    {WIDGET_REGISTRY[widget.type]}
                  </div>
                </Widget>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
