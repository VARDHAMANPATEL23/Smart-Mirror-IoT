"use client";

import React, { useEffect, useState } from "react";

export function AiContentWidget() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full h-full flex-col justify-center items-center text-center p-4">
      {/* Visual representation of 3D Face/Particles */}
      <div
        className={`w-32 h-32 rounded-full border border-cyan-500/50 flex items-center justify-center transition-all duration-1000 ${
          pulse
            ? "shadow-[0_0_40px_rgba(34,211,238,0.4)] scale-105"
            : "shadow-[0_0_10px_rgba(34,211,238,0.1)] scale-100"
        }`}
      >
        <div className="text-cyan-400 font-bold opacity-50 text-xs tracking-widest uppercase">
          [ 3D AI FACE ]
        </div>
      </div>
      <div className="mt-6 text-white/50 text-sm font-bold tracking-wide animate-pulse">
        Particles flowing... AI invoked...
      </div>
    </div>
  );
}
