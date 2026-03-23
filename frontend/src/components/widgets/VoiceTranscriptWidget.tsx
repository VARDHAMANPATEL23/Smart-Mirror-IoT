"use client";

import React, { useEffect, useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

export function VoiceTranscriptWidget() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isWakeWordDetected, setIsWakeWordDetected] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for Browser Support
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      setTranscript("Voice not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
        setIsListening(false);
        // Auto-restart if it stops (standard for interactive mirrors)
        if (!isWakeWordDetected) {
            try { recognition.start(); } catch {}
        }
    };

    recognition.onresult = (event: any) => {
      let current = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      
      const lower = current.toLowerCase();
      setTranscript(current);

      // WAKE WORD DETECTION: "Mirror" or "Hey Mirror"
      if (lower.includes("mirror") && !isWakeWordDetected) {
          setIsWakeWordDetected(true);
          setTranscript("Listening...");
          
          // Small delay to allow the user to speak their command after the wake word
          setTimeout(() => {
              // Extract the command (anything after 'mirror')
              const parts = lower.split("mirror");
              const command = parts[parts.length - 1].trim();
              
              if (command.length > 3) {
                  // Trigger the AI Face
                  window.dispatchEvent(new CustomEvent("mirror-ai-trigger", { 
                    detail: { prompt: command } 
                  }));
                  
                  // Reset for next command
                  setIsWakeWordDetected(false);
                  setTranscript(current); 
              } else {
                  // If no command yet, keep waiting
                  setIsWakeWordDetected(false);
              }
          }, 2000);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch {}

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  return (
    <div className="flex w-full h-full flex-col justify-center items-center px-6 overflow-hidden relative bg-black/20 rounded-xl border border-white/5">
      <div className={`absolute inset-0 bg-linear-to-r from-cyan-500/0 ${isListening ? "via-cyan-500/5" : "via-transparent"} to-cyan-500/0 animate-pulse`}></div>

      <div className="flex items-center gap-3 mb-2 z-10">
          {isListening ? (
              <Mic size={14} className="text-cyan-400 animate-pulse" />
          ) : (
              <MicOff size={14} className="text-red-500/50" />
          )}
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
            {isWakeWordDetected ? "Active Listening" : "Voice Standby"}
          </span>
      </div>

      <div className="text-lg font-light italic tracking-tight text-white/80 text-center relative z-10 line-clamp-2 min-h-[3rem] flex items-center justify-center">
        {transcript || '"Say Mirror to start..."'}
      </div>

      {/* Audio waveform visualization */}
      <div className="mt-4 flex gap-1 items-end h-6 relative z-10 w-full justify-center opacity-30">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`w-1 bg-cyan-400 rounded-full ${isListening ? "animate-bounce" : ""}`}
            style={{
              height: isListening ? `${20 + Math.random() * 80}%` : '4px',
              animationDelay: `${i * 0.05}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
