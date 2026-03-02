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
    <div className="flex w-full h-full flex-col justify-center items-center text-center gap-2">
      <div className="text-xl font-bold tracking-wide text-cyan-300 uppercase drop-shadow-[0_0_2px_rgba(103,232,249,0.5)]">
        {time.toLocaleDateString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </div>
      <div className="text-6xl font-normal tracking-wide text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.6)] font-seven-segment">
        {time.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: false,
        })}
      </div>
      <div className="text-sm font-bold text-white/50 uppercase mt-2">
        Upcoming Alarm: None
      </div>
    </div>
  );
}
