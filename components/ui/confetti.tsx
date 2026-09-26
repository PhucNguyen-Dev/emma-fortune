"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/lib/state/AppStateContext";

const COLORS = ["#d98ca3", "#d6b779", "#54243f", "#f7e4e8", "#a8546e", "#fbf1e7"];

type Piece = {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  color: string;
  width: number;
  height: number;
};

/** One-shot celebratory confetti. Renders nothing when motion should be reduced. */
export function Confetti({ active }: { active: boolean }) {
  const { state } = useAppState();
  const reducedMotion = state.preferences.reducedMotion === true;
  const [pieces, setPieces] = useState<Piece[] | null>(null);

  useEffect(() => {
    if (!active || reducedMotion) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- confetti pieces are generated client-side only to keep SSR deterministic
    setPieces(
      Array.from({ length: 42 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.8 + Math.random() * 1.4,
        drift: (Math.random() - 0.5) * 160,
        spin: 360 + Math.random() * 720,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        width: 6 + Math.random() * 6,
        height: 10 + Math.random() * 8,
      })),
    );
    const timer = window.setTimeout(() => setPieces(null), 4200);
    return () => window.clearTimeout(timer);
  }, [active, reducedMotion]);

  if (!pieces) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((piece, index) => (
        <span
          key={index}
          className="absolute top-0 animate-confetti-fall rounded-[2px]"
          style={{
            left: `${piece.left}%`,
            width: piece.width,
            height: piece.height,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ["--confetti-drift" as string]: `${piece.drift}px`,
            ["--confetti-spin" as string]: `${piece.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
