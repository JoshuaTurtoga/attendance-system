"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  calculateLeaveDuration,
  calculateArriveDuration,
} from "@/lib/transitions/stagger-transition";

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
 * Coordinates staggered exits and entrances of child blocks marked with `.stagger-block`
 * and `--i` indices based on the BrewedOps Motion Library specification.
 * Synchronized with the 587ms spring speed of the Notch tab sidebar navigation.
 *
 * - Fast-click responsive: If the user clicks tabs faster, the stagger transition
 *   starts IMMEDIATELY without waiting to finish the animation from previous tabs.
 * - Zero 1-frame flash: Outgoing content stays mounted during leaving.
 * - Old blocks leave in sequence (190ms ease-in + 35ms stagger delay).
 * - New blocks arrive in sequence (340ms cubic-bezier(0.32, 0.72, 0, 1) + 35ms stagger delay).
 * - Under prefers-reduced-motion: reduce, uses a single quick cross-fade (150ms).
 */
export function StaggeredView({
  children,
  transitionKey,
  blockCount = 4,
  className = "",
  syncWithNotch = true,
}: StaggeredViewProps) {
  // prevTransitionKey records the last transitionKey prop we handled
  const [prevTransitionKey, setPrevTransitionKey] = useState(transitionKey);
  const [phase, setPhase] = useState<StaggerPhase>("idle");
  const [version, setVersion] = useState(0);

  // Content states
  const [currentContent, setCurrentContent] = useState<React.ReactNode>(children);
  const [outgoingContent, setOutgoingContent] = useState<React.ReactNode>(null);
  const [incomingContent, setIncomingContent] = useState<React.ReactNode>(children);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When transitionKey prop changes:
  if (transitionKey !== prevTransitionKey) {
    setPrevTransitionKey(transitionKey);
    setVersion((v) => v + 1);

    if (phase === "idle") {
      // Normal transition start from idle: old blocks leave in sequence
      setOutgoingContent(currentContent);
      setIncomingContent(children);
      setPhase("leaving");
    } else {
      // FAST CLICK INTERRUPTION:
      // The user clicked tabs faster before the previous transition completed.
      // Immediately cancel the previous transition and start the new tab's arrival cascade immediately!
      setCurrentContent(children);
      setIncomingContent(children);
      setOutgoingContent(null);
      setPhase("arriving");
    }
  }

  // Keep currentContent updated while idle when on the same key (e.g. form edits)
  if (transitionKey === prevTransitionKey && phase === "idle" && currentContent !== children) {
    setCurrentContent(children);
  }

  // Handle phase progression timers
  useEffect(() => {
    // Clear any existing timer when phase, key or version changes
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (phase === "leaving") {
      const leaveDuration = prefersReducedMotion
        ? 150
        : calculateLeaveDuration(blockCount, syncWithNotch);

      timerRef.current = setTimeout(() => {
        // Swap content cleanly when last block has left
        setCurrentContent(incomingContent);
        setPhase("arriving");
        setVersion((v) => v + 1);
      }, leaveDuration);
    } else if (phase === "arriving") {
      const arriveDuration = prefersReducedMotion
        ? 150
        : calculateArriveDuration(blockCount, syncWithNotch);

      timerRef.current = setTimeout(() => {
        setPhase("idle");
        setOutgoingContent(null);
        setIncomingContent(null);
      }, arriveDuration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, version, blockCount, syncWithNotch, incomingContent]);

  // Determine what to display:
  // - during leaving: outgoingContent
  // - during arriving: incomingContent (or currentContent)
  // - during idle: currentContent (or children)
  const renderedContent =
    phase === "leaving"
      ? (outgoingContent ?? currentContent)
      : (currentContent ?? children);

  return (
    <div
      key={`${prevTransitionKey}-${phase === "leaving" ? "leaving" : "v" + version}`}
      className={`stagger-container ${className}`}
      data-stagger-phase={phase}
      data-transitioning={phase !== "idle"}
      aria-busy={phase !== "idle"}
    >
      {renderedContent}
    </div>
  );
}

export default StaggeredView;

