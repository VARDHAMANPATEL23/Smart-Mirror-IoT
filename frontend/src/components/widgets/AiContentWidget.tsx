"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaceVisualizer } from "@/components/face/FaceVisualizer";
import { User, Users } from "lucide-react";

interface AiContentWidgetProps {
  mirrorId?: string;
  aiBackendUrl?: string; // dynamically discovered
}

export function AiContentWidget({ mirrorId, aiBackendUrl }: AiContentWidgetProps) {
  const [pulse, setPulse] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [error, setError] = useState<string>("");
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthesisRef.current = window.speechSynthesis;
    const interval = setInterval(() => setPulse((p) => !p), 1500);
    
    const handleTrigger = (e: any) => {
      if (e.detail?.prompt) {
        askAi(e.detail.prompt, e.detail.persona || "default");
      }
    };

    window.addEventListener("mirror-ai-trigger", handleTrigger);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("mirror-ai-trigger", handleTrigger);
      if (synthesisRef.current) synthesisRef.current.cancel();
    };
  }, [aiBackendUrl]);

  const speakText = useCallback((text: string) => {
    if (!synthesisRef.current) return;
    
    // Stop any current speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a matching voice
    const voices = synthesisRef.current.getVoices();
    const voice = voices.find(v => 
        gender === "male" 
            ? v.name.includes("Google US English") || v.name.includes("Male") 
            : v.name.includes("Female") || v.name.includes("Zira")
    ) || voices[0];
    
    if (voice) utterance.voice = voice;
    utterance.pitch = gender === "male" ? 0.9 : 1.1;
    utterance.rate = 1.0;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synthesisRef.current.speak(utterance);
  }, [gender]);

  // Function to ask the AI
  const askAi = async (prompt: string, persona: string = "default") => {
    if (!aiBackendUrl) {
      setError("AI Backend not discovered yet");
      return;
    }

    setLoading(true);
    setError("");
    setSpeaking(false);
    if (synthesisRef.current) synthesisRef.current.cancel();

    try {
      const res = await fetch(`${aiBackendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, persona }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "AI failed");
      
      setResponse(data.response);
      speakText(data.response);

    } catch (err: any) {
      setError(err.message || "Failed to reach AI server");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full flex-col justify-center items-center text-center p-2 group bg-black/40 rounded-3xl border border-white/5 shadow-2xl">
      
      <div
        className={`w-full h-[60%] min-h-[180px] relative transition-transform duration-1000 ${
          pulse ? "scale-[1.03]" : "scale-100"
        }`}
      >
        <FaceVisualizer isThinking={loading} isSpeaking={speaking} gender={gender} />
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="text-cyan-400 font-bold opacity-70 text-[10px] tracking-[0.5em] uppercase border-y border-cyan-500/30 px-4 py-1.5 backdrop-blur-sm animate-pulse">
                Thinking...
             </div>
          </div>
        )}

        <div className="absolute top-0 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
            <button 
                onClick={() => setGender(prev => prev === "male" ? "female" : "male")}
                className="p-1.5 bg-black/50 border border-white/10 rounded-full text-white/40 hover:text-cyan-400 transition-colors"
                title={`Switch to ${gender === "male" ? "Female" : "Male"} Persona`}
            >
                {gender === "male" ? <User size={14} /> : <Users size={14} />}
            </button>
        </div>
      </div>

      <div className="mt-4 w-full h-[25%] flex flex-col justify-center overflow-hidden px-4">
        {error ? (
          <div className="text-[10px] text-red-400/80 font-mono tracking-wide px-2">{error}</div>
        ) : response ? (
          <div className="text-sm text-white/95 font-light leading-relaxed tracking-wide line-clamp-4 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            {response}
          </div>
        ) : (
          <div className="text-[10px] text-white/20 font-bold tracking-[0.4em] uppercase animate-pulse">
            Mirror Mind: Listening
          </div>
        )}
      </div>

      {aiBackendUrl && !loading && (
        <button 
          onClick={() => askAi("Hello! Who are you today?")}
          className="mt-2 text-[8px] text-white/10 hover:text-cyan-500 transition-all uppercase tracking-[0.5em] hover:tracking-[0.8em]"
        >
          [ Wake Consciousness ]
        </button>
      )}
    </div>
  );
}
