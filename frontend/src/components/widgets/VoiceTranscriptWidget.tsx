import React from "react";

export function VoiceTranscriptWidget() {
  return (
    <div className="flex w-full h-full flex-col justify-center items-center px-4 overflow-hidden relative">
      <div className="absolute top-0 bottom-0 left-0 right-0 bg-linear-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 animate-pulse"></div>

      <div className="text-xl font-bold italic tracking-wide text-cyan-200 drop-shadow-[0_0_2px_rgba(103,232,249,0.8)] text-center relative z-10">
        "Hello Vardhman, I am analyzing your tasks for today."
      </div>

      {/* Fake audio waveform */}
      <div className="mt-4 flex gap-1 items-end h-8 relative z-10 w-full justify-center opacity-50">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-cyan-400 rounded-full animate-bounce"
            style={{
              height: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
