"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Stars, PerspectiveCamera } from "@react-three/drei";
import { FaceParticles } from "./FaceParticles";

interface FaceVisualizerProps {
  isThinking?: boolean;
  isSpeaking?: boolean;
  gender?: "male" | "female";
}

export function FaceVisualizer({ 
  isThinking = false, 
  isSpeaking = false, 
  gender = "male" 
}: FaceVisualizerProps) {
  return (
    // Strictly centered aspect-square container
    <div className="w-full h-full relative aspect-square flex items-center justify-center overflow-hidden">
      <div className="w-full h-full absolute inset-0">
        <Canvas
          style={{ background: "transparent", pointerEvents: "none" }}
          gl={{ alpha: true, antialias: true, stencil: false, depth: true }}
          dpr={[1, 2]} 
        >
          {/* Explicit Camera for perfect centering */}
          <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={38} />
          
          <Suspense fallback={null}>
            <ambientLight intensity={isThinking ? 1.5 : (isSpeaking ? 1.0 : 0.6)} />
            <pointLight 
               position={[10, 10, 10]} 
               intensity={isThinking ? 3 : (isSpeaking ? 1.5 : 1)} 
               color={isThinking ? "#ffffff" : "#22d3ee"} 
            />
            
            {/* Background stars */}
            <Stars 
               radius={50} 
               depth={50} 
               count={isThinking ? 1500 : 800} 
               factor={isThinking ? 6 : 4} 
               saturation={0} 
               fade speed={0.2} 
            />

            {/* Float reduced significantly to maintain centered focus */}
            <Float 
               speed={isThinking ? 4 : (isSpeaking ? 1.5 : 0.8)} 
               rotationIntensity={isThinking ? 0.8 : (isSpeaking ? 0.4 : 0.2)} 
               floatIntensity={0.25}
               floatingRange={[-0.05, 0.05]}
            >
              <FaceParticles isThinking={isThinking} isSpeaking={isSpeaking} gender={gender} />
            </Float>
          </Suspense>
        </Canvas>
      </div>
      
      {/* Outer Glow Aura */}
      {(isThinking || isSpeaking) && (
        <div className={`absolute inset-0 pointer-events-none rounded-full transition-all duration-1000 ${
          isThinking ? "shadow-[0_0_100px_rgba(255,255,255,0.15)] opacity-100" : "shadow-[0_0_60px_rgba(34,211,238,0.1)] opacity-60"
        } animate-pulse`} />
      )}
    </div>
  );
}
