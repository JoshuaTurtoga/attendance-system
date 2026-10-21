"use client";

import React, { useState, useEffect, useRef } from "react";
import { calculateArriveDuration } from "@/lib/transitions/stagger-transition";

export interface StaggeredViewProps {
  children: React.ReactNode;
  transitionKey: string;
  blockCount?: number;
  className?: string;
  syncWithNotch?: boolean;
}

export type StaggerPhase = "idle" | "leaving" | "arriving";

/**
 * StaggeredView Component
 *
 * Coordinates staggered entrances of child blocks marked with `.stagger-block`
 * and `--i` indices based on the BrewedOps Motion Library specification.
 * Synchronized with the 587ms spring speed of the Notch tab sidebar navigation.
 *
 * - Zero flash-of-unstyled-content: Entering blocks start with opacity: 0 and transform: translateY(8px) scale(0.98).
 * - Smooth entrance cascade: Each block cascades in sequence (340ms cubic-bezier(0.32, 0.72, 0, 1) + 35ms delay).
 * - Instant responsiveness on rapid clicks: Cancels pending transition and immediately cascades new view.
 * - Under prefers-reduced-motion: reduce, uses a single quick cross-fade (150ms).
 */
export function StaggeredView({
  children,
  transitionKey,
  blockCount = 5,
  className = "",
  syncWithNotch = true,
}: StaggeredViewProps) {
  const [phase, setPhase] = useState<StaggerPhase>("idle");
  const prevKeyRef = useRef(transitionKey);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (transitionKey !== prevKeyRef.current) {
      prevKeyRef.current = transitionKey;
      setPhase("arriving");

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const arriveDuration = prefersReducedMotion
        ? 150
        : calculateArriveDuration(blockCount, syncWithNotch);

      timerRef.current = setTimeout(() => {
        setPhase("idle");
        timerRef.current = null;
      }, arriveDuration);
    }
  }, [transitionKey, blockCount, syncWithNotch]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      key={transitionKey}
      className={`stagger-container ${className}`}
      data-stagger-phase={phase}
      data-transitioning={phase !== "idle"}
      aria-busy={phase !== "idle"}
    >
      {children}
    </div>
  );
}

export default StaggeredView;

