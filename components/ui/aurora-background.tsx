"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";

export interface AuroraBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  showRadialGradient?: boolean;
  className?: string;
}

/**
 * 21st.dev Aurora Background by Dhileep Kumar GM (@dhileepkumargm)
 * Multi-layered animated aurora sky effect featuring pulsing radial gradients,
 * drifting blurred color blobs, and twinkling stars built with React, Tailwind CSS, and Framer Motion.
 */
export function AuroraBackground({
  children,
  showRadialGradient = true,
  className = "",
  ...props
}: AuroraBackgroundProps) {
  const baseId = useId();

  // Deterministic Star Field Generation for Twinkling Polar Lights
  const stars = Array.from({ length: 48 }).map((_, i) => ({
    id: `${baseId}-star-${i}`,
    top: `${(i * 17) % 97}%`,
    left: `${(i * 23) % 97}%`,
    size: (i % 3) + 1.5,
    delay: (i % 5) * 0.8,
    duration: (i % 4) + 2.5,
  }));

  return (
    <div
      className={`relative flex flex-col min-h-screen w-full items-center justify-center bg-[#050816] text-[#F8FAFC] overflow-hidden transition-colors ${className}`}
      {...props}
    >
      {/* BACKGROUND LAYER 1: Deep Polar Night Container */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Pulsing Ambient Radial Gradients */}
        {showRadialGradient && (
          <>
            <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[120%] h-[70%] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.18)_0%,rgba(34,211,238,0.12)_35%,rgba(99,102,241,0.05)_65%,transparent_80%)] blur-2xl" />
            <div className="absolute -bottom-[20%] right-0 w-[80%] h-[60%] bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.15)_0%,rgba(139,92,246,0.1)_40%,transparent_75%)] blur-2xl" />
          </>
        )}

        {/* BACKGROUND LAYER 2: Drifting Blurred Aurora Color Blobs (Framer Motion) */}
        <div className="absolute inset-0 opacity-60 mix-blend-screen filter blur-[70px]">
          {/* Blob 1: Electric Cyan & Primary Blue Stream */}
          <motion.div
            animate={{
              x: ["-20%", "20%", "-10%", "-20%"],
              y: ["-10%", "15%", "-20%", "-10%"],
              scale: [1, 1.25, 0.95, 1],
              rotate: [0, 45, -30, 0],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#3B82F6] via-[#22D3EE] to-[#6366F1] opacity-70"
          />

          {/* Blob 2: Soft Indigo & Cyan Flow */}
          <motion.div
            animate={{
              x: ["25%", "-15%", "10%", "25%"],
              y: ["20%", "-10%", "25%", "20%"],
              scale: [1.1, 0.9, 1.2, 1.1],
              rotate: [-20, 30, -10, -20],
            }}
            transition={{
              duration: 26,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            className="absolute top-[35%] right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#6366F1] via-[#3B82F6] to-[#22D3EE] opacity-60"
          />

          {/* Blob 3: Soft Violet & Deep Electric Blue Swirl */}
          <motion.div
            animate={{
              x: ["-15%", "15%", "-25%", "-15%"],
              y: ["25%", "-20%", "10%", "25%"],
              scale: [0.9, 1.3, 1, 0.9],
              rotate: [40, -40, 20, 40],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            className="absolute bottom-[10%] left-[25%] w-[550px] h-[550px] rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] opacity-50"
          />
        </div>

        {/* BACKGROUND LAYER 3: Twinkling Star Field Simulation */}
        <div className="absolute inset-0 opacity-80">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
              }}
              animate={{
                opacity: [0.15, 0.95, 0.15],
                scale: [0.75, 1.35, 0.75],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
                ease: "easeInOut",
              }}
              className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            />
          ))}
        </div>

        {/* Subtle Grid Noise Texture Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(248,250,252,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(248,250,252,0.015)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_60%,transparent_100%)] opacity-35" />
      </div>

      {/* FOREGROUND LAYER: Main Application Content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
