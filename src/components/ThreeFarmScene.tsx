import React from "react";
import { Sprout } from "lucide-react";

interface ThreeFarmSceneProps {
  viewMode?: "hero" | "dashboard" | "orb" | "education";
}

export default function ThreeFarmScene({ viewMode = "hero" }: ThreeFarmSceneProps) {
  if (viewMode === "orb") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a5c38]/10 border border-[#1a5c38]/20 rounded-full animate-pulse">
        <Sprout className="w-6 h-6 text-[#1a5c38]" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#edf4ee] to-[#d1e4d5] rounded-2xl border border-[#c5ddc9] p-6 relative overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-10 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="border border-[#1a5c38]" />
        ))}
      </div>
      <div className="z-10 text-center">
        <div className="w-16 h-16 mx-auto bg-[#1a5c38]/10 rounded-full flex items-center justify-center mb-3 animate-bounce">
          <Sprout className="w-8 h-8 text-[#1a5c38]" />
        </div>
        <h4 className="text-sm font-bold text-[#1a2e1c]">Smart Farm telemetry</h4>
        <p className="text-xs text-[#4a6550] mt-1">Lightweight Agricultural Sensor Grid</p>
      </div>
    </div>
  );
}
