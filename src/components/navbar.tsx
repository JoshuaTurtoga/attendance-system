"use client";

import { Sidebar, type CurvedSidebarProps } from "./sidebar";

/**
 * Navbar - Rebuilt as the Curved Inverted Tab Sidebar
 *
 * For backwards compatibility with any existing imports, Navbar delegates
 * directly to the complete curved sidebar navigation system.
 */
export function Navbar(props: CurvedSidebarProps) {
  return <Sidebar {...props} />;
}

export { Sidebar };
export default Sidebar;
