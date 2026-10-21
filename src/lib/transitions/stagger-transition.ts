/**
 * Staggered Page/Tab Transition Engine
 *
 * Implements mathematical timing, per-block delay caps, View Transitions API
 * parameters, and reduced-motion cross-fade overrides based on the
 * BrewedOps Motion Library specification, synchronized with the Notch Tab Sidebar (587ms).
 */

// Notch tab sidebar synchronization constants (587ms total duration)
export const NOTCH_SIDEBAR_DURATION_MS = 587;
export const NOTCH_STAGGER_LEAVE_MS = 190;
export const NOTCH_STAGGER_ARRIVE_MS = 340;
export const NOTCH_PER_BLOCK_DELAY_MS = 35;
export const NOTCH_MAX_DELAY_MS = 120;

// Base library constants
export const STAGGER_PER_BLOCK_DELAY_MS = 70;
export const STAGGER_MAX_DELAY_MS = 350;
export const STAGGER_LEAVE_DURATION_MS = 250;
export const STAGGER_ARRIVE_DURATION_MS = 450;
export const STAGGER_LEAVE_EASING = "ease-in";
export const STAGGER_ARRIVE_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";
export const STAGGER_TRANSFORM_OFFSET = "translateY(10px) scale(0.94)";

/**
 * Calculates animation delay for a block at index i, capped at maxDelayMs.
 */
export function calculateBlockDelay(
  index: number,
  perBlockDelayMs: number = STAGGER_PER_BLOCK_DELAY_MS,
  maxDelayMs: number = STAGGER_MAX_DELAY_MS
): number {
  return Math.min(Math.max(0, index) * perBlockDelayMs, maxDelayMs);
}

/**
 * Calculates the total time needed for all leaving blocks to complete their exit.
 * Total time = base leave duration + delay of the last block.
 */
export function calculateLeaveDuration(
  blockCount: number,
  syncWithNotch: boolean = false,
  leaveDurationMs?: number,
  perBlockDelayMs?: number,
  maxDelayMs?: number
): number {
  const baseLeave = leaveDurationMs ?? (syncWithNotch ? NOTCH_STAGGER_LEAVE_MS : STAGGER_LEAVE_DURATION_MS);
  const stepDelay = perBlockDelayMs ?? (syncWithNotch ? NOTCH_PER_BLOCK_DELAY_MS : STAGGER_PER_BLOCK_DELAY_MS);
  const capDelay = maxDelayMs ?? (syncWithNotch ? NOTCH_MAX_DELAY_MS : STAGGER_MAX_DELAY_MS);

  if (blockCount <= 0) return baseLeave;
  const maxDelay = calculateBlockDelay(blockCount - 1, stepDelay, capDelay);
  return baseLeave + maxDelay;
}

/**
 * Calculates the total arrive sequence duration for blockCount blocks.
 */
export function calculateArriveDuration(
  blockCount: number,
  syncWithNotch: boolean = false,
  arriveDurationMs?: number,
  perBlockDelayMs?: number,
  maxDelayMs?: number
): number {
  const baseArrive = arriveDurationMs ?? (syncWithNotch ? NOTCH_STAGGER_ARRIVE_MS : STAGGER_ARRIVE_DURATION_MS);
  const stepDelay = perBlockDelayMs ?? (syncWithNotch ? NOTCH_PER_BLOCK_DELAY_MS : STAGGER_PER_BLOCK_DELAY_MS);
  const capDelay = maxDelayMs ?? (syncWithNotch ? NOTCH_MAX_DELAY_MS : STAGGER_MAX_DELAY_MS);

  if (blockCount <= 0) return baseArrive;
  const maxDelay = calculateBlockDelay(blockCount - 1, stepDelay, capDelay);
  return baseArrive + maxDelay;
}

export interface StaggerTransitionConfig {
  isReducedMotion: boolean;
  leaveDurationMs: number;
  arriveDurationMs: number;
  useTransform: boolean;
  leaveEasing: string;
  arriveEasing: string;
}

/**
 * Resolves the configuration for the transition sequence.
 * Under prefers-reduced-motion, returns a single quick cross-fade with no transform.
 */
export function resolveStaggerTransitionConfig(
  prefersReducedMotion: boolean,
  blockCount: number = 3,
  syncWithNotch: boolean = false
): StaggerTransitionConfig {
  if (prefersReducedMotion) {
    return {
      isReducedMotion: true,
      leaveDurationMs: 150,
      arriveDurationMs: 150,
      useTransform: false,
      leaveEasing: "ease",
      arriveEasing: "ease",
    };
  }

  return {
    isReducedMotion: false,
    leaveDurationMs: calculateLeaveDuration(blockCount, syncWithNotch),
    arriveDurationMs: calculateArriveDuration(blockCount, syncWithNotch),
    useTransform: true,
    leaveEasing: STAGGER_LEAVE_EASING,
    arriveEasing: STAGGER_ARRIVE_EASING,
  };
}

/**
 * Extracts the highest `--i` index from an HTML string or element snippet.
 * Defaults to fallback (or 3) if no indices are found.
 */
export function extractMaxBlockIndex(html: string, fallback: number = 3): number {
  if (!html) return fallback;
  const regex = /--i\s*:\s*(\d+)/g;
  let max = -1;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val > max) {
      max = val;
    }
  }
  return max >= 0 ? max : fallback;
}
