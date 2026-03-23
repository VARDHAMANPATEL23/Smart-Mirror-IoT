"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FaceParticlesProps {
  isThinking?: boolean;
  isSpeaking?: boolean;
  gender?: "male" | "female";
}

export function FaceParticles({ 
  isThinking = false, 
  isSpeaking = false, 
  gender = "male" 
}: FaceParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const sparksRef = useRef<THREE.Points>(null!);
  
  const RESOLUTION = 64;
  const count = RESOLUTION * RESOLUTION;
  const sparkCount = 400;

  // 1. IMPROVED PARAMETRIC GEOMETRY BASED ON REFERENCE
  const [gridPositions, gridScales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    
    for (let i = 0; i < RESOLUTION; i++) {
      for (let j = 0; j < RESOLUTION; j++) {
        const idx = i * RESOLUTION + j;
        
        // Normalize UV coordinates
        const u = i / RESOLUTION; 
        const v = j / RESOLUTION;

        // Spherical mapping
        const phi = u * Math.PI;
        const theta = v * 2 * Math.PI;

        let x = Math.sin(phi) * Math.cos(theta);
        let y = Math.cos(phi);
        let z = Math.sin(phi) * Math.sin(theta);

        // --- Parametric Head Shaping Logic ---
        // Flatten the back
        if (z < 0) z *= 0.5;
        
        // Human feature morphing:
        // Nose protrusion
        const nose = Math.exp(-(Math.pow(x, 2) + Math.pow(y - 0.1, 2)) / 0.02);
        z += nose * 0.4;

        // Chin/Jaw shape (Adjusted based on gender)
        const chinFactor = gender === "male" ? 0.25 : 0.15;
        const chinWidth = gender === "male" ? 0.15 : 0.08;
        const chin = Math.exp(-(Math.pow(x, 2) + Math.pow(y + 0.6, 2)) / chinWidth);
        z += chin * chinFactor;

        // Overall scaling
        pos[idx * 3] = x * 1.5;
        pos[idx * 3 + 1] = y * 2;
        pos[idx * 3 + 2] = z * 1.2;
        
        scl[idx] = 0.5 + Math.random() * 0.5;
      }
    }
    return [pos, scl];
  }, [gender]);

  // 2. Neural Sparks Generator (Amber Nodes)
  const [sparkPos, sparkScl] = useMemo(() => {
    const pos = new Float32Array(sparkCount * 3);
    const scl = new Float32Array(sparkCount);
    for (let i = 0; i < sparkCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 2;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 1;
        scl[i] = Math.random();
    }
    return [pos, scl];
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!pointsRef.current) return;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    const transitionSpeed = isThinking ? 4 : (isSpeaking ? 5.5 : 0.8);

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Original base coordinates
      const bx = gridPositions[ix];
      const by = gridPositions[iy];
      const bz = gridPositions[iz];

      // 1. Breathing Animation (Slower, global expansion)
      const breathScale = 1 + Math.sin(t * transitionSpeed) * (isThinking ? 0.04 : 0.015);
      
      // 2. Lip Movement Logic (Synchronized with speaking state)
      let lipOffset = 0;
      const isMouthArea = by < -0.2 && by > -0.6 && Math.abs(bx) < 0.6;
      
      if (isSpeaking && isMouthArea) {
        // Multiplier ensures lips move more in center, less at corners
        const intensity = Math.cos(bx * 3) * 0.08;
        lipOffset = Math.sin(t * 12) * intensity;
      }

      // Add thinking jitter
      let jitter = 0;
      if (isThinking && Math.random() > 0.95) {
          jitter = (Math.random() - 0.5) * 0.02;
      }

      array[ix] = bx * breathScale + jitter;
      array[iy] = (by + lipOffset) * breathScale;
      array[iz] = bz * breathScale;
    }
    posAttr.needsUpdate = true;

    // Sparks Animation
    sparksRef.current.rotation.y = t * 0.05;
    const sparkAttr = sparksRef.current.geometry.attributes.position;
    const sparkArr = sparkAttr.array as Float32Array;
    for (let i = 0; i < sparkCount; i++) {
        sparkArr[i * 3 + 1] += Math.sin(t + i) * 0.002;
    }
    sparkAttr.needsUpdate = true;
  });

  return (
    <group>
      {/* 1. THE MAIN FACE GRID (Now with Parametric Shaping) */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[gridPositions, 3]} />
          <bufferAttribute attach="attributes-scale" args={[gridScales, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={isThinking ? 0.045 : 0.035}
          color={isThinking ? "#ffffff" : "#a277ff"} // The requested Purple color
          transparent
          opacity={0.9}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 2. THE NEURAL SPARKS (Amber Nodes) */}
      <points ref={sparksRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkPos, 3]} />
          <bufferAttribute attach="attributes-scale" args={[sparkScl, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color="#fbbf24"
          transparent
          opacity={isThinking ? 0.9 : 0.4}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
