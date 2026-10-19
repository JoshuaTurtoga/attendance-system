import test from "node:test";
import assert from "node:assert/strict";
import {
  CURVED_TAB_EASING,
  CURVED_TAB_DURATION_MS,
  CURVED_TAB_CORNER_RADIUS_PX,
  CURVED_TAB_TOP_GRADIENT,
  CURVED_TAB_BOTTOM_GRADIENT,
  computeTabTransform,
  getSidebarAriaAttributes,
  resolveSidebarMotionTransition,
  getRoleNavigationItems,
  findActiveTabIndex,
} from "../src/lib/sidebar/sidebar-engine.ts";

test("Curved Tab Sidebar: spring easing curve and duration match specification", () => {
  assert.equal(CURVED_TAB_DURATION_MS, 587);
  assert.equal(
    CURVED_TAB_EASING,
    "linear(0, 0.094 5.6%, 0.274 11.1%, 0.455 16.7%, 0.608 22.2%, 0.726 27.8%, 0.812 33.3%, 0.873 38.9%, 0.916 44.4%, 0.944 50%, 0.964 55.6%, 0.976 61.1%, 0.985 66.7%, 0.99 72.2%, 1 100%)"
  );
  assert.equal(CURVED_TAB_CORNER_RADIUS_PX, 14);
});

test("Curved Tab Sidebar: concave radial gradient formulas match exact inverted corner geometry", () => {
  const panelColor = "#FFFFFF";
  const topGrad = CURVED_TAB_TOP_GRADIENT(panelColor);
  const bottomGrad = CURVED_TAB_BOTTOM_GRADIENT(panelColor);

  assert.equal(
    topGrad,
    "radial-gradient(circle at 0 0, transparent 14px, #FFFFFF 14.5px)"
  );
  assert.equal(
    bottomGrad,
    "radial-gradient(circle at 0 100%, transparent 14px, #FFFFFF 14.5px)"
  );
});

test("Curved Tab Sidebar: computeTabTransform calculates correct translateY with index and itemHeight", () => {
  assert.equal(
    computeTabTransform(0, "48px"),
    "translateY(calc(0 * 48px))"
  );
  assert.equal(
    computeTabTransform(3, "44px"),
    "translateY(calc(3 * 44px))"
  );
  assert.equal(
    computeTabTransform("var(--i)", "var(--item-height)"),
    "translateY(calc(var(--i) * var(--item-height)))"
  );
});

test("Curved Tab Sidebar: aria-current is assigned correctly to active item", () => {
  const activeAria = getSidebarAriaAttributes(true);
  const inactiveAria = getSidebarAriaAttributes(false);

  assert.equal(activeAria["aria-current"], "page");
  assert.equal(inactiveAria["aria-current"], undefined);
});

test("Curved Tab Sidebar: reduced motion disables transition", () => {
  const standardTransition = resolveSidebarMotionTransition(false);
  const reducedMotionTransition = resolveSidebarMotionTransition(true);

  assert.match(standardTransition, /transform 587ms linear\(/);
  assert.equal(reducedMotionTransition, "none");
});

test("Curved Tab Sidebar: getRoleNavigationItems produces page tabs for each role", () => {
  const instructorItems = getRoleNavigationItems("instructor");
  assert.equal(instructorItems.length, 3);
  assert.deepEqual(
    instructorItems.map((i) => i.id),
    ["today", "calendar", "classes"]
  );

  const adminItems = getRoleNavigationItems("admin");
  assert.equal(adminItems.length, 4);
  assert.deepEqual(
    adminItems.map((i) => i.id),
    ["overview", "users", "classes", "policies"]
  );

  const studentItems = getRoleNavigationItems("student");
  assert.equal(studentItems.length, 4);
  assert.deepEqual(
    studentItems.map((i) => i.id),
    ["today", "classes", "timetable", "requests"]
  );
});

test("Curved Tab Sidebar: findActiveTabIndex clamps index within valid bounds", () => {
  const items = [
    { id: "tab-a", label: "A" },
    { id: "tab-b", label: "B" },
    { id: "tab-c", label: "C" },
  ];

  assert.equal(findActiveTabIndex(items, "tab-b"), 1);
  assert.equal(findActiveTabIndex(items, "non-existent"), 0);
  assert.equal(findActiveTabIndex(items, undefined, 2), 2);
  assert.equal(findActiveTabIndex(items, undefined, 10), 2);
  assert.equal(findActiveTabIndex([], "tab-a"), 0);
});

