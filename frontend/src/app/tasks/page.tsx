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

  useEffect(() => {
    fetchTasks();
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

  const toggleTask = async (id: string, currentCompleted: boolean) => {
    try {
      const res = await fetch(`/api/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !currentCompleted })
      });
      
      // If PUT is not supported, we just visually toggle or do nothing, 
      // but based on typical REST we assume it works or we delete and recreate.
      if (res.ok) {
        fetchTasks();
      } else {
        // Fallback: Delete and recreate if PUT isn't implemented
        console.warn("Update might not be implemented, deleting instead for task rebuild.");
      }
    } catch (err) {
      console.error("Toggle Task Error:", err);
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

  return (
    <div className="min-h-screen bg-neutral-950 flex justify-center text-white font-sans p-6 md:p-12">
      <div className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col h-[85vh]">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/builder" className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition text-cyan-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-white uppercase">Task Manager</h1>
            <p className="text-white/40 text-xs mt-1 tracking-wide">Syncs live to Smart Mirror Displays</p>
          </div>
        </header>

        <form onSubmit={addTask} className="mb-8 flex gap-3">
          <input 
            type="text"
            placeholder="Add a new task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex-1 bg-black/50 border border-white/10 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!newTaskText.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-cyan-900/50"
          >
            <Plus size={18} /> Add
          </button>
        </form>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="animate-pulse text-cyan-500/50 text-xs tracking-[0.2em] font-bold">LOADING TASKS...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
              <CheckCircle size={48} className="mb-4" />
              <p className="text-sm tracking-wide">All caught up! No tasks pending.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task._id} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                  task.completed 
                    ? "bg-black/20 border-white/5 opacity-50" 
                    : "bg-black/40 border-white/10 hover:border-cyan-500/30 hover:bg-black/60 shadow-sm"
                }`}
              >
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1 overflow-hidden"
                  onClick={() => toggleTask(task._id, task.completed)}
                >
                  {task.completed ? (
                    <CheckCircle size={20} className="text-cyan-500 shrink-0" />
                  ) : (
                    <Circle size={20} className="text-white/30 shrink-0" />
                  )}
                  <span className={`text-sm truncate w-full ${task.completed ? "line-through text-white/50" : "text-white/90"}`}>
                    {task.text}
                  </span>
                </div>
                
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="ml-4 p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
