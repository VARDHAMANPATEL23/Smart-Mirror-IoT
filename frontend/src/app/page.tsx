"use client";

import Link from "next/link";
import { 
  Monitor, 
  Cpu, 
  Settings, 
  Layout, 
  LogIn, 
  UserPlus, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const steps = [
    {
      title: "1. Setup Hardware",
      desc: "Connect your screen to Raspberry Pi and boot into Chromium in kiosk mode.",
      icon: <Cpu className="text-cyan-400" size={24} />
    },
    {
      title: "2. Register Mirror",
      desc: "Go to /rpi-login on your mirror to link it with a unique ID and PIN.",
      icon: <Monitor className="text-cyan-400" size={24} />
    },
    {
      title: "3. Design Layout",
      desc: "Use the Display Builder here to drag and drop widgets for your specific needs.",
      icon: <Layout className="text-cyan-400" size={24} />
    },
    {
      title: "4. Live Update",
      desc: "Publish your changes and watch your mirror update in real-time via SSE.",
      icon: <Zap className="text-cyan-400" size={24} />
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
      {/* Background Gradient Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
            <ShieldCheck size={20} className="text-black" />
          </div>
          <span className="text-lg font-bold tracking-tighter">SMART<span className="text-cyan-400">MIRROR</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold text-white/50 hover:text-white transition-colors">AUTHENTICATE</Link>
          <Link href="/register" className="text-sm font-bold bg-white text-black px-4 py-2 rounded-lg hover:bg-cyan-400 transition-all">INITIALIZE</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-[10px] font-bold tracking-[0.2em] mb-6 animate-pulse">
              SYSTEM ONLINE — IoT READY
            </div>
            <h1 className="text-6xl lg:text-7xl font-light tracking-tight mb-8 leading-[1.1]">
              Elevate Your <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-500">Workspace</span>
            </h1>
            <p className="text-lg text-white/40 mb-10 max-w-lg leading-relaxed font-light">
              A high-performance IoT dashboard for personalized smart mirrors. 
              Manage widgets, layouts, and real-time updates from a secure, minimalist cloud interface.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/builder" className="group flex items-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.2)]">
                BUILD YOUR DISPLAY
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/rpi-login" className="flex items-center gap-3 border border-white/10 hover:border-white/30 text-white/70 hover:text-white font-bold py-4 px-8 rounded-xl transition-all">
                RPi LOGIN
              </Link>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-8">
              <Settings className="text-cyan-500" size={18} />
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Deployment Guide</h2>
            </div>
            
            <div className="grid gap-6">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="flex-none w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1 tracking-wide">{step.title}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-cyan-500 mt-0.5" />
              <p className="text-[10px] text-cyan-400/80 leading-relaxed font-mono">
                NOTICE: SYSTEM DEPLOYED ON NEXT.JS 16 ENGINE. 
                ENSURE TERMINAL AUTHENTICATION BEFORE ATTEMPTING MIRROR LINK.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
            © 2026 Smart Mirror IoT Control System
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] font-mono text-white/10 tracking-widest uppercase">Encryption: AES-256</span>
            <span className="text-[10px] font-mono text-white/10 tracking-widest uppercase">Protocol: Webhook-SSE</span>
            <span className="text-[10px] font-mono text-white/10 tracking-widest uppercase">Next v16.1.6</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
