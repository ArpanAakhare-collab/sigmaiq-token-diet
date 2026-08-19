"use client";

import { CinematicFooter } from "@/components/ui/motion-footer";

export default function DemoPage() {
  return (
    <div className="relative w-full bg-[#070A12] min-h-screen font-sans selection:bg-white/20 overflow-x-hidden text-white">

      {/* 
        MAIN CONTENT AREA 
        Allows user to scroll down and reveal the footer underneath.
      */}
      <main className="relative z-10 w-full min-h-[120vh] bg-[#0D1320] flex flex-col items-center justify-center text-white border-b border-[#243043] shadow-2xl rounded-b-3xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(59,130,246,0.08)_0%,transparent_60%)] pointer-events-none" />
        
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-[0.2em] text-[#94A3B8] mb-8 uppercase text-center px-4">
          Scroll down to reveal SigmaIQ Footer
        </h1>
        
        <div className="w-[1px] h-32 bg-gradient-to-b from-[#3B82F6] to-transparent" />
      </main>

      {/* The Cinematic Footer is injected here */}
      <CinematicFooter />
      
    </div>
  );
}
