import React from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";

export interface NeonMeshProps {
  className?: string;
  intensity?: "subtle" | "medium" | "prominent";
  interactive?: boolean;
}

export function NeonMesh({ className = "" }: NeonMeshProps) {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      <AuroraBackground showRadialGradient={true} className="min-h-full" />
    </div>
  );
}
