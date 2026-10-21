"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";
import {
  GraduationCap,
  BookOpen,
  User,
  Calendar,
  Clock,
  LayoutGrid,
  Sparkles,
  Users,
  Settings,
  KeyRound,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import type { Role } from "@/types";
import {
  getSidebarAriaAttributes,
  findActiveTabIndex,
} from "@/lib/sidebar/sidebar-engine";
import { DepartmentLabel } from "@/components/department-label";

export interface SidebarNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: string | number;
  onClick?: () => void;
}

export interface CurvedSidebarProps {
  items?: SidebarNavItem[];
  activeId?: string;
  activeTabId?: string;
  defaultActiveIndex?: number;
  onSelect?: (item: SidebarNavItem, index: number) => void;
  onTabChange?: (tabId: string) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebarBg?: string;
  panelColor?: string;
  itemHeight?: number;
  sidebarPadRight?: number;
  className?: string;
}

const getRoleLabel = (role: Role) => {
  switch (role) {
    case "admin":
      return "Admin POV";
    case "instructor":
      return "Instructor POV";
    case "student":
      return "Student POV";
  }
};

const getRoleBadgeStyle = (role: Role) => {
  switch (role) {
    case "admin":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "instructor":
      return "bg-rose-50 text-[#7C1D26] border-[#7C1D26]/20";
    case "student":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
};

/**
 * Curved Inverted Tab Sidebar Navigation System
 *
 * Replaces the top navigation bar with a full-height sidebar whose active item
 * becomes a tab cut into the sidebar's right edge. The adjacent white content
 * panel appears to bulge out and meet the active item via two 14px concave
 * inverted corners drawn by radial-gradients on the single animated `.tab` element.
 */
export function Sidebar({
  items: propItems,
  activeId,
  activeTabId,
  defaultActiveIndex = 0,
  onSelect,
  onTabChange,
  header,
  footer,
  sidebarBg = "#EAEAEF",
  panelColor = "#FFFFFF",
  itemHeight = 48,
  sidebarPadRight = 16,
  className = "",
}: CurvedSidebarProps) {
  const {
    currentUser,
    activeView,
    signOut,
  } = useAuth();

  const [internalIndex, setInternalIndex] = useState(defaultActiveIndex);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Default dynamic tabs corresponding to the active role
  const defaultItemsForRole: SidebarNavItem[] = React.useMemo(() => {
    switch (activeView) {
      case "instructor":
        return [
          {
            id: "today",
            label: "Today's Hub",
            icon: <Calendar className="w-4 h-4" />,
            href: "/instructor/today",
          },
          {
            id: "calendar",
            label: "Weekly Schedule",
            icon: <Clock className="w-4 h-4" />,
            href: "/instructor/schedule",
          },
          {
            id: "classes",
            label: "All Classes",
            icon: <LayoutGrid className="w-4 h-4" />,
            href: "/instructor/classes",
          },
        ];
      case "admin":
        return [
          {
            id: "overview",
            label: "System Oversight",
            icon: <Sparkles className="w-4 h-4" />,
            href: "/admin/overview",
          },
          {
            id: "users",
            label: "User Directory",
            icon: <Users className="w-4 h-4" />,
            href: "/admin/users",
          },
          {
            id: "classes",
            label: "Class Oversight",
            icon: <BookOpen className="w-4 h-4" />,
            href: "/admin/classes",
          },
          {
            id: "policies",
            label: "Policy & Terms",
            icon: <Settings className="w-4 h-4" />,
            href: "/admin/policies",
          },
        ];
      case "student":
        return [
          {
            id: "today",
            label: "Today's Hub",
            icon: <Clock className="w-4 h-4" />,
            href: "/student/today",
          },
          {
            id: "classes",
            label: "My Enrolled Classes",
            icon: <BookOpen className="w-4 h-4" />,
            href: "/student/classes",
          },
          {
            id: "timetable",
            label: "Weekly Timetable",
            icon: <Calendar className="w-4 h-4" />,
            href: "/student/timetable",
          },
          {
            id: "requests",
            label: "Requests & Excuses",
            icon: <KeyRound className="w-4 h-4" />,
            href: "/student/requests",
          },
        ];
      default:
        return [];
    }
  }, [activeView]);

  const navItems = propItems ?? defaultItemsForRole;

  // Resolve active index with safe bounds clamping
  const currentActiveId = activeId ?? activeTabId;
  const activeIndex = findActiveTabIndex(
    navItems,
    currentActiveId,
    internalIndex
  );

  const handleItemClick = (item: SidebarNavItem, index: number) => {
    setInternalIndex(index);
    if (item.onClick) {
      item.onClick();
    }
    if (onSelect) {
      onSelect(item, index);
    }
    if (onTabChange) {
      onTabChange(item.id);
    }
    setMobileDrawerOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full min-h-screen py-6 pl-5">
      <div className="flex flex-col">
        {/* Header / Brand & POV Switcher */}
        {header ? (
          <div className="mb-6 pr-4">{header}</div>
        ) : (
          <div className="mb-6 pr-4 space-y-4">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C1D26] text-white flex items-center justify-center shadow-sm shadow-[#7C1D26]/25 shrink-0">
                <GraduationCap className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-950 tracking-tight text-base truncate">
                    AcademiaTrack
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-200/70 text-zinc-600 border border-zinc-300/60 font-semibold shrink-0">
                    v1.0
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight truncate">
                  Digital Class Record & Attendance
                </p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="flex items-center">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${getRoleBadgeStyle(
                  activeView
                )}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {getRoleLabel(activeView)}
              </span>
            </div>
          </div>
        )}

        {/* Section Title */}
        <div className="mb-2 pr-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Navigation
        </div>

        {/* Nav List containing ONE sliding .tab element and items */}
        <nav
          className="nav-list"
          role="navigation"
          aria-label="Sidebar navigation"
        >
          {/* ONE absolutely positioned sliding tab element with concave pseudo-corners */}
          <div
            className="tab"
            aria-hidden="true"
            data-testid="curved-tab-indicator"
          />

          <ul className="list-none m-0 p-0" role="list">
            {navItems.map((item, index) => {
              const isActive = index === activeIndex;
              const ariaAttrs = getSidebarAriaAttributes(isActive);

              const content = (
                <div className="flex flex-row items-center w-full min-w-0">
                  {item.icon && (
                    <span
                      className={`mr-3 shrink-0 flex items-center justify-center transition-colors ${
                        isActive
                          ? "text-[#7C1D26]"
                          : "text-zinc-500 group-hover:text-zinc-800"
                      }`}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate flex-1 tracking-tight text-sm">
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                        isActive
                          ? "bg-[#7C1D26]/10 text-[#7C1D26]"
                          : "bg-zinc-200/80 text-zinc-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );

              return (
                <li key={item.id || index} className="p-0 m-0 h-[48px]">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="nav-item group flex flex-row items-center w-full h-[48px] px-5 text-left select-none"
                      {...ariaAttrs}
                      onClick={() => handleItemClick(item, index)}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="nav-item group flex flex-row items-center w-full h-[48px] px-5 text-left cursor-pointer select-none"
                      {...ariaAttrs}
                      onClick={() => handleItemClick(item, index)}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer / User Profile Card */}
      {footer ? (
        <div className="mt-auto pt-4 pr-4">{footer}</div>
      ) : (
        <div className="mt-auto pt-6 pr-4 border-t border-zinc-200/70">
          <div className="flex flex-col gap-2">
            <div className="w-full flex items-center gap-2.5 p-2 rounded-2xl bg-white border border-zinc-200/80 shadow-xs text-left">
              <div className="w-8 h-8 rounded-full bg-[#7C1D26]/10 border border-[#7C1D26]/20 flex items-center justify-center text-[#7C1D26] font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 truncate">
                  {currentUser
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : "Signed in"}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {currentUser?.department ? (
                    <DepartmentLabel department={currentUser.department} />
                  ) : (
                    currentUser?.studentNumber || ""
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false);
                void signOut();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-semibold text-[#7C1D26] bg-rose-50 hover:bg-rose-100 transition cursor-pointer border border-[#7C1D26]/20 whitespace-nowrap"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar (< md) */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#F4F4F6] border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7C1D26] text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-zinc-950 text-sm">AcademiaTrack</span>
            <span className="ml-1.5 text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-200 text-zinc-600 font-semibold">
              v1.0
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-xs cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileDrawerOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <aside
            className={`curved-sidebar relative w-72 h-full select-none shadow-2xl overflow-y-auto ${className}`}
            style={
              {
                "--sidebar-bg": sidebarBg,
                "--panel-color": panelColor,
                "--item-height": `${itemHeight}px`,
                "--sidebar-pad-right": `${sidebarPadRight}px`,
                "--i": activeIndex,
              } as React.CSSProperties
            }
            aria-label="Mobile Navigation"
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Persistent Sidebar (md+) */}
      <aside
        className={`curved-sidebar hidden md:flex flex-col w-64 lg:w-72 shrink-0 select-none sticky top-0 h-screen overflow-y-auto ${className}`}
        style={
          {
            "--sidebar-bg": sidebarBg,
            "--panel-color": panelColor,
            "--item-height": `${itemHeight}px`,
            "--sidebar-pad-right": `${sidebarPadRight}px`,
            "--i": activeIndex,
          } as React.CSSProperties
        }
        aria-label="Main Navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export default Sidebar;
