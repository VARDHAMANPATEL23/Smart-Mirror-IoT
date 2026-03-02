"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

export function TasksWidget() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Review 3D Particle system code", done: true },
    { id: 2, text: "Integrate Voice Recognition API", done: false },
    { id: 3, text: "Finish Display Builder drag-and-drop", done: false },
    { id: 4, text: "Connect database for UI persistence", done: false },
  ]);

  return (
    <div className="flex w-full h-full flex-col justify-center px-4 overflow-hidden">
      <div className="flex flex-col gap-3 py-2 w-full max-h-[140px] overflow-hidden">
        <div className="animate-[scroll_15s_linear_infinite] flex flex-col gap-3 h-max">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3">
              {task.done ? (
                <CheckCircle size={18} className="text-cyan-600 shrink-0" />
              ) : (
                <Circle size={18} className="text-white/50 shrink-0" />
              )}
              <span
                className={`text-lg font-bold tracking-wide drop-shadow-[0_0_2px_rgba(255,255,255,0.4)] truncate ${
                  task.done ? "text-white/40 line-through" : "text-white"
                }`}
              >
                {task.text}
              </span>
            </div>
          ))}
          {/* Duplicate set for seamless scrolling */}
          {tasks.map((task) => (
            <div key={`dup-${task.id}`} className="flex items-center gap-3">
              {task.done ? (
                <CheckCircle size={18} className="text-cyan-600 shrink-0" />
              ) : (
                <Circle size={18} className="text-white/50 shrink-0" />
              )}
              <span
                className={`text-lg font-bold tracking-wide drop-shadow-[0_0_2px_rgba(255,255,255,0.4)] truncate ${
                  task.done ? "text-white/40 line-through" : "text-white"
                }`}
              >
                {task.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
