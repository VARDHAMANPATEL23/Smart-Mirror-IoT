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
    <div className="flex w-full h-full flex-col px-4 py-2 overflow-hidden bg-black/10 rounded-xl border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">To-Do List</span>
        <span className="text-[10px] text-cyan-600 font-mono">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
      </div>

      {/* Task List with Scrolling Animation (only if many tasks) */}
      <div className="flex-1 w-full overflow-hidden relative">
        <div className={`flex flex-col gap-2.5 w-full ${tasks.length > 4 ? "animate-[scroll_20s_linear_infinite]" : ""}`}>
          {tasks.map((task) => (
            <div key={task._id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3 truncate">
                {task.completed ? (
                  <CheckCircle size={16} className="text-cyan-600 shrink-0" />
                ) : (
                  <Circle size={16} className="text-white/40 shrink-0" />
                )}
                <span
                  className={`text-sm font-light tracking-wide truncate ${
                    task.completed ? "text-white/30 line-through" : "text-white/90"
                  }`}
                >
                  {task.text}
                </span>
              </div>
              {isBuilder && (
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          
          {/* Duplicate set for seamless scrolling if overhead */}
          {tasks.length > 4 && tasks.map((task) => (
            <div key={`dup-${task._id}`} className="flex items-center gap-3">
               {task.completed ? (
                  <CheckCircle size={16} className="text-cyan-600 shrink-0" />
                ) : (
                  <Circle size={16} className="text-white/40 shrink-0" />
                )}
              <span className={`text-sm font-light tracking-wide truncate ${task.completed ? "text-white/30 line-through" : "text-white/90"}`}>
                {task.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Add Input (Only in Builder mode) */}
      {isBuilder && (
        <form onSubmit={addTask} className="mt-3 flex gap-2 pt-2 border-t border-white/5">
          <input 
            type="text"
            placeholder="New task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-cyan-500/50"
          />
          <button type="submit" className="text-cyan-500 hover:text-cyan-300">
            <Plus size={16} />
          </button>
        </form>
      )}
    </div>
  );
}
