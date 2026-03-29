"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle, Circle, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TaskItem {
  _id: string;
  text: string;
  completed: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (err) {
      console.error("Tasks Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTaskText }),
      });
      if (res.ok) { setNewTaskText(""); fetchTasks(); }
    } catch (err) {
      console.error("Add Task Error:", err);
    }
  };

  const toggleTask = async (id: string, currentCompleted: boolean) => {
    try {
      const res = await fetch(`/api/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !currentCompleted })
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error("Toggle Task Error:", err);
    }
  };

  const deleteTask = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error("Delete Task Error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href="/builder" className="p-2 bg-white/5 hover:bg-white/10 active:bg-white/20 rounded-xl transition text-cyan-400 touch-manipulation">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-black tracking-widest text-white uppercase leading-none">TASK MANAGER</h1>
          <p className="text-white/30 text-[10px] uppercase font-bold tracking-[0.15em] mt-0.5">Syncs live to mirror</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-white/20 bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-widest">
            {pending.length} left
          </span>
        </div>
      </header>

      {/* Add Task Input — sticky above keyboard on mobile */}
      <div className="sticky top-[57px] z-10 bg-neutral-950/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <form onSubmit={addTask} className="flex gap-2">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            // 16px font prevents iOS auto-zoom on focus
            className="flex-1 bg-black/60 border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-3 text-base text-white placeholder-white/25 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-30 text-white px-4 rounded-xl font-black flex items-center gap-1.5 transition-colors touch-manipulation whitespace-nowrap"
          >
            <Plus size={18} />
          </button>
        </form>
      </div>

      {/* Task List */}
      <main className="flex-1 px-4 py-4 max-w-2xl w-full mx-auto space-y-6 pb-24">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="animate-pulse text-cyan-500/40 text-[11px] tracking-[0.2em] font-black uppercase">Loading Tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-25 text-center gap-3">
            <CheckCircle size={52} strokeWidth={1.5} />
            <p className="text-sm uppercase tracking-widest font-black">All clear!</p>
            <p className="text-xs text-white/50">No pending tasks.</p>
          </div>
        ) : (
          <>
            {/* Pending */}
            {pending.length > 0 && (
              <section className="space-y-2">
                <p className="text-[9px] uppercase tracking-[0.25em] font-black text-white/20 px-1 mb-3">Pending</p>
                {pending.map(task => (
                  <TaskRow key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} deleting={deletingId === task._id} />
                ))}
              </section>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <section className="space-y-2">
                <p className="text-[9px] uppercase tracking-[0.25em] font-black text-white/20 px-1 mb-3">Completed</p>
                {completed.map(task => (
                  <TaskRow key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} deleting={deletingId === task._id} />
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete, deleting }: {
  task: TaskItem;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
      task.completed
        ? "bg-black/20 border-white/5 opacity-50"
        : "bg-black/40 border-white/8 active:bg-black/60"
    }`}>
      {/* Toggle — large touch target */}
      <button
        onClick={() => onToggle(task._id, task.completed)}
        className="p-1 shrink-0 touch-manipulation"
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed
          ? <CheckCircle size={22} className="text-cyan-500" />
          : <Circle size={22} className="text-white/25" />
        }
      </button>

      {/* Text */}
      <span
        onClick={() => onToggle(task._id, task.completed)}
        className={`flex-1 text-sm leading-snug cursor-pointer touch-manipulation ${task.completed ? "line-through text-white/40" : "text-white/90"}`}
      >
        {task.text}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(task._id)}
        disabled={deleting}
        className="p-2 text-white/15 hover:text-red-400 active:text-red-500 rounded-xl transition-colors touch-manipulation"
        aria-label="Delete task"
      >
        <Trash2 size={17} className={deleting ? "animate-pulse" : ""} />
      </button>
    </div>
  );
}
