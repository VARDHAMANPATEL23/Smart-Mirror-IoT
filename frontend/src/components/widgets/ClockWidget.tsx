"use client";

import { useEffect, useState } from "react";

export function ClockWidget() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="animate-pulse">Loading Clock...</div>;

  return (
    <div className="flex w-full h-full flex-col justify-center items-center text-center gap-3">
      <div className="text-2xl font-black tracking-widest text-cyan-400 uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
        {time.toLocaleDateString([], {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </div>
      <div className="text-8xl font-seven-segment tracking-tighter text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
        {time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </div>
      <div className="text-base font-black text-white/30 uppercase mt-2 tracking-[0.2em]">
        ALARM: OFF
      </div>
    </div>
  );
}
