import test from "node:test";
import assert from "node:assert/strict";
import {
  STAGGER_PER_BLOCK_DELAY_MS,
  STAGGER_MAX_DELAY_MS,
  STAGGER_LEAVE_DURATION_MS,
  STAGGER_ARRIVE_DURATION_MS,
  STAGGER_ARRIVE_EASING,
  STAGGER_LEAVE_EASING,
  STAGGER_TRANSFORM_OFFSET,
  NOTCH_SIDEBAR_DURATION_MS,
  NOTCH_STAGGER_LEAVE_MS,
  NOTCH_STAGGER_ARRIVE_MS,
  NOTCH_PER_BLOCK_DELAY_MS,
  NOTCH_MAX_DELAY_MS,
  calculateBlockDelay,
  calculateLeaveDuration,
  calculateArriveDuration,
  resolveStaggerTransitionConfig,
  extractMaxBlockIndex,
} from "../src/lib/transitions/stagger-transition.ts";

test("Stagger Transition: constants match the specification and BrewedOps Motion Library", () => {
  assert.equal(STAGGER_PER_BLOCK_DELAY_MS, 70);
  assert.equal(STAGGER_MAX_DELAY_MS, 350);
  assert.equal(STAGGER_LEAVE_DURATION_MS, 250);
  assert.equal(STAGGER_ARRIVE_DURATION_MS, 450);
  assert.equal(STAGGER_LEAVE_EASING, "ease-in");
  assert.equal(STAGGER_ARRIVE_EASING, "cubic-bezier(0.32, 0.72, 0, 1)");
  assert.equal(STAGGER_TRANSFORM_OFFSET, "translateY(10px) scale(0.94)");
});

test("Stagger Transition: calculateBlockDelay caps at 350ms for long pages", () => {
  assert.equal(calculateBlockDelay(0), 0);
  assert.equal(calculateBlockDelay(1), 70);
  assert.equal(calculateBlockDelay(2), 140);
  assert.equal(calculateBlockDelay(4), 280);
  assert.equal(calculateBlockDelay(5), 350);
  assert.equal(calculateBlockDelay(6), 350);
  assert.equal(calculateBlockDelay(15), 350);
});

test("Stagger Transition: calculateLeaveDuration waits for all staggered blocks", () => {
  // 1 block (index 0): 250ms + 0ms = 250ms
  assert.equal(calculateLeaveDuration(1), 250);
  // 3 blocks (last index 2): 250ms + 140ms = 390ms
  assert.equal(calculateLeaveDuration(3), 390);
  // 8 blocks (last index 7, delay capped at 350ms): 250ms + 350ms = 600ms
  assert.equal(calculateLeaveDuration(8), 600);
});

test("Stagger Transition: calculateArriveDuration returns 450ms plus capped delay", () => {
  assert.equal(calculateArriveDuration(1), 450);
  assert.equal(calculateArriveDuration(3), 590);
  assert.equal(calculateArriveDuration(10), 800);
});

test("Stagger Transition: resolveStaggerTransitionConfig handles reduced motion", () => {
  const normalConfig = resolveStaggerTransitionConfig(false, 3);
  assert.equal(normalConfig.isReducedMotion, false);
  assert.equal(normalConfig.leaveDurationMs, 390);
  assert.equal(normalConfig.useTransform, true);

  const reducedConfig = resolveStaggerTransitionConfig(true, 3);
  assert.equal(reducedConfig.isReducedMotion, true);
  assert.equal(reducedConfig.leaveDurationMs, 150);
  assert.equal(reducedConfig.arriveDurationMs, 150);
  assert.equal(reducedConfig.useTransform, false);
});

test("Stagger Transition: notch sidebar synchronization constants and calculations align with 587ms", () => {
  assert.equal(NOTCH_SIDEBAR_DURATION_MS, 587);
  assert.equal(NOTCH_STAGGER_LEAVE_MS, 190);
  assert.equal(NOTCH_STAGGER_ARRIVE_MS, 340);
  assert.equal(NOTCH_PER_BLOCK_DELAY_MS, 35);
  assert.equal(NOTCH_MAX_DELAY_MS, 120);

  // 1 block: leave = 190ms, arrive = 340ms, total = 530ms
  assert.equal(calculateLeaveDuration(1, true), 190);
  assert.equal(calculateArriveDuration(1, true), 340);

  // 3 blocks: leave = 190 + 70 = 260ms, arrive = 340 + 70 = 410ms
  assert.equal(calculateLeaveDuration(3, true), 260);
  assert.equal(calculateArriveDuration(3, true), 410);

  const notchConfig = resolveStaggerTransitionConfig(false, 3, true);
  assert.equal(notchConfig.leaveDurationMs, 260);
  assert.equal(notchConfig.arriveDurationMs, 410);
});

test("Stagger Transition: extractMaxBlockIndex accurately extracts the highest --i from HTML", () => {
  assert.equal(
    extractMaxBlockIndex('<div style="--i: 0">A</div><div style="--i: 2">B</div>'),
    2
  );
  assert.equal(
    extractMaxBlockIndex('<div class="stagger-block" style="--i: 4; color: red;">Card</div>'),
    4
  );
  assert.equal(
    extractMaxBlockIndex('<div class="stagger-block">No index</div>', 5),
    5
  );
  assert.equal(extractMaxBlockIndex("", 3), 3);
});

