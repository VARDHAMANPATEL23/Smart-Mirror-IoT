"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle, Circle, Plus, Trash2 } from "lucide-react";

interface TaskItem {
  _id: string;
  text: string;
  completed: boolean;
}

interface TasksWidgetProps {
  mirrorId?: string;
  isBuilder?: boolean;
}

export function TasksWidget({ mirrorId, isBuilder = false }: TasksWidgetProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const url = mirrorId ? `/api/tasks?mirrorId=${mirrorId}` : "/api/tasks";
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (err) {
      console.error("Tasks Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [mirrorId]);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3000); // 3-second pulse
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTaskText }),
      });
      if (res.ok) {
        setNewTaskText("");
        fetchTasks();
      }
    } catch (err) {
      console.error("Add Task Error:", err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error("Delete Task Error:", err);
    }
  };

  const [pageIndex, setPageIndex] = useState(0);
  const tasksPerPage = 4;
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  // Vertical Page Rotation
  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(() => {
      setPageIndex((p) => (p + 1) % totalPages);
    }, 7000); // Rotate every 7 seconds
    return () => clearInterval(interval);
  }, [totalPages]);

  if (loading && tasks.length === 0) return (
    <div className="flex items-center justify-center h-full text-white/20 text-[10px] uppercase tracking-widest animate-pulse">
      Loading Tasks...
    </div>
  );

  return (
    <div className="flex w-full h-full flex-col px-5 py-3 overflow-hidden bg-black/10 rounded-xl border border-white/5 relative group">
      <style>{`
        @keyframes verticalSnap {
          0% { transform: translateY(20px); opacity: 0; }
          10% { transform: translateY(0); opacity: 1; }
          90% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-20px); opacity: 0; }
        }
        .animate-vertical-snap {
          animation: verticalSnap 7s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">To-Do List</span>
        <span className="text-xs text-cyan-500 font-bold font-mono">PAGE {pageIndex + 1}/{totalPages || 1}</span>
      </div>

      {/* Task List with Vertical Snapping */}
      <div className="flex-1 w-full overflow-hidden relative">
        <div key={pageIndex} className={`flex flex-col gap-3.5 w-full ${totalPages > 1 ? "animate-vertical-snap" : ""}`}>
          {tasks.slice(pageIndex * tasksPerPage, (pageIndex + 1) * tasksPerPage).map((task) => (
            <div key={task._id} className="flex items-center justify-between group/item">
              <div className="flex items-center gap-4 truncate">
                {task.completed ? (
                  <CheckCircle size={20} className="text-cyan-500 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.3)]" />
                ) : (
                  <Circle size={20} className="text-white/30 shrink-0" />
                )}
                <span
                  className={`text-base font-bold tracking-tight truncate ${
                    task.completed ? "text-white/20 line-through decoration-cyan-500/30" : "text-white/90"
                  }`}
                >
                  {task.text}
                </span>
              </div>
              {isBuilder && (
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination indicators (vertical style) */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
        {Array.from({ length: totalPages }).map((_, i) => (
          <div 
            key={i} 
            className={`w-1 transition-all duration-500 rounded-full ${i === pageIndex ? "h-6 bg-cyan-500" : "h-1.5 bg-white/10"}`} 
          />
        ))}
      </div>

      {/* Quick Add Input (Only in Builder mode) */}
      {isBuilder && (
        <form onSubmit={addTask} className="mt-4 flex gap-2 pt-3 border-t border-white/5">
          <input 
            type="text"
            placeholder="ADD NEW TASK..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50 uppercase placeholder:text-white/20"
          />
          <button type="submit" className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 p-2 rounded-lg transition-colors">
            <Plus size={18} />
          </button>
        </form>
      )}
    </div>
  );
}

