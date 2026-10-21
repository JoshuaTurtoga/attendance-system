"use client";

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  calculateLeaveDuration,
  calculateArriveDuration,
  extractMaxBlockIndex,
} from "@/lib/transitions/stagger-transition";

export interface StaggeredViewProps {
  children: React.ReactNode;
  transitionKey: string;
  blockCount?: number;
  className?: string;
  syncWithNotch?: boolean;
}

export type StaggerPhase = "idle" | "leaving" | "arriving";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * StaggeredView Component
 *
 * Implements a true 2-phase staggered page and tab transition:
 * 1. OUT Phase: The blocks of the current/old view leave one after another (--i cascade).
 * 2. Content SWAP: Occurs strictly after the last block of the outgoing view has fully exited.
 * 3. IN Phase: The blocks of the new view arrive in sequence (--i cascade).
 *
 * Guarantees:
 * - NO UI Flash
 * - NO Preload visible view of the next tab during the OUT phase
 * - NO Double-Take of tab/sub-tab views
 * - Frozen DOM snapshot of outgoing view during OUT (prevents Next.js URL/param updates from leaking)
 * - Interruptible on fast clicking
 * - Prefers-reduced-motion: quick 150ms cross-fade
 * - No external animation libraries
 */
export function StaggeredView({
  children,
  transitionKey,
  blockCount = 4,
  className = "",
  syncWithNotch = false,
}: StaggeredViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [prevKey, setPrevKey] = useState<string>(transitionKey);
  const [targetKey, setTargetKey] = useState<string>(transitionKey);
  const [displayedKey, setDisplayedKey] = useState<string>(transitionKey);
  const [phase, setPhase] = useState<StaggerPhase>("idle");
  const [currentHtml, setCurrentHtml] = useState<string>("");
  const [outgoingHtml, setOutgoingHtml] = useState<string | null>(null);

  // Synchronously update currentHtml when idle and stage is mounted
  useIsomorphicLayoutEffect(() => {
    if (phase === "idle" && stageRef.current) {
      const html = stageRef.current.innerHTML;
      if (html && html !== currentHtml) {
        setCurrentHtml(html);
      }
    }
  }, [phase, currentHtml]);

  // Handle transitionKey changes strictly without reading refs during render
  if (transitionKey !== prevKey) {
    setPrevKey(transitionKey);
    setTargetKey(transitionKey);

    if (phase === "idle") {
      if (currentHtml && currentHtml.trim().length > 0) {
        setOutgoingHtml(currentHtml);
        setPhase("leaving");
      } else {
        setDisplayedKey(transitionKey);
        setPhase("arriving");
      }
    } else {
      // Fast-click interruption:
      setOutgoingHtml(null);
      setDisplayedKey(transitionKey);
      setPhase("arriving");
    }
  }

  // Handle transition phase timings
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (phase === "leaving") {
      const maxBlockIndex = outgoingHtml
        ? extractMaxBlockIndex(outgoingHtml, blockCount - 1)
        : blockCount - 1;

      const leaveDuration = prefersReducedMotion
        ? 150
        : calculateLeaveDuration(maxBlockIndex + 1, syncWithNotch);

      timerRef.current = setTimeout(() => {
        setOutgoingHtml(null);
        setDisplayedKey(targetKey);
        setPhase("arriving");
      }, leaveDuration);
    } else if (phase === "arriving") {
      let maxBlockIndex = blockCount - 1;
      if (stageRef.current) {
        const blocks = stageRef.current.querySelectorAll(".stagger-block");
        if (blocks.length > 0) {
          let highest = 0;
          blocks.forEach((el) => {
            const val = (el as HTMLElement).style.getPropertyValue("--i");
            const parsed = parseInt(val, 10);
            if (!isNaN(parsed) && parsed > highest) highest = parsed;
          });
          maxBlockIndex = highest;
        }
      }

      const arriveDuration = prefersReducedMotion
        ? 150
        : calculateArriveDuration(maxBlockIndex + 1, syncWithNotch);

      timerRef.current = setTimeout(() => {
        setPhase("idle");
      }, arriveDuration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, targetKey, outgoingHtml, blockCount, syncWithNotch]);

  return (
    <div
      ref={containerRef}
      className={`stagger-container ${className}`}
      data-stagger-phase={phase}
      data-transitioning={phase !== "idle"}
      aria-busy={phase !== "idle"}
    >
      {phase === "leaving" && outgoingHtml ? (
        <div
          className="stagger-outgoing-frame"
          dangerouslySetInnerHTML={{ __html: outgoingHtml }}
        />
      ) : (
        <div ref={stageRef} key={displayedKey} className="stagger-stage">
          {children}
        </div>
      )}
    </div>
  );
}

export default StaggeredView;
