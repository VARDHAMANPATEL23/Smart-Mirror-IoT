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
    const interval = setInterval(fetchTasks, 60000); // Refresh every minute
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

  if (loading && tasks.length === 0) return (
    <div className="flex items-center justify-center h-full text-white/20 text-[10px] uppercase tracking-widest animate-pulse">
      Loading Tasks...
    </div>
  );

  return (
    <div className="flex w-full h-full flex-col px-5 py-3 overflow-hidden bg-black/10 rounded-xl border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">To-Do List</span>
        <span className="text-xs text-cyan-500 font-bold font-mono">{tasks.length} {tasks.length === 1 ? 'TASK' : 'TASKS'}</span>
      </div>

      {/* Task List with Scrolling Animation (only if many tasks) */}
      <div className="flex-1 w-full overflow-hidden relative">
        <div className={`flex flex-col gap-3.5 w-full ${tasks.length > 4 ? "animate-[scroll_20s_linear_infinite]" : ""}`}>
          {tasks.map((task) => (
            <div key={task._id} className="flex items-center justify-between group">
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
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          
          {/* Duplicate set for seamless scrolling if overhead */}
          {tasks.length > 4 && tasks.map((task) => (
            <div key={`dup-${task._id}`} className="flex items-center gap-4">
               {task.completed ? (
                  <CheckCircle size={20} className="text-cyan-500 shrink-0" />
                ) : (
                  <Circle size={20} className="text-white/30 shrink-0" />
                )}
              <span className={`text-base font-bold tracking-tight truncate ${task.completed ? "text-white/20 line-through" : "text-white/90"}`}>
                {task.text}
              </span>
            </div>
          ))}
        </div>
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
