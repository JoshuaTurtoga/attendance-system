"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { AcademicClass } from "@/types";
import { useAuth } from "@/features/auth/auth-context";
import { Sidebar, type SidebarNavItem } from "@/components/sidebar";
import { StaggeredView } from "@/components/staggered-view";
import {
  InstructorHub,
  type InstructorViewTab,
} from "@/components/instructor-hub";
import { AdminHub, type AdminTab } from "@/components/admin-hub";
import { StudentHub, type StudentTab } from "@/components/student-hub";
import { ClassWorkspace, type WorkspaceTab } from "@/components/class-workspace";
import {
  createClass,
  listVisibleClasses,
  type CreateClassInput,
} from "@/lib/data/classes";
import { FirstTimePasswordModal } from "./first-time-password-modal";
import { SuspensionNoticeBanner } from "./suspension-notice-banner";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  TrendingUp,
  FileText,
} from "lucide-react";

export interface OpenClassOptions {
  tab?: WorkspaceTab;
  rollCall?: boolean;
  gradingToday?: boolean;
}

const WORKSPACE_TABS: { id: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
  { id: "roster", label: "Class Roster", icon: <Users className="w-4 h-4" /> },
  {
    id: "attendance",
    label: "Attendance System",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    id: "grades",
    label: "Categorized Grades",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  { id: "notes", label: "Class Notes", icon: <FileText className="w-4 h-4" /> },
];

/**
 * Authenticated portal shell. The curved sidebar is the single navigation
 * control for every role — including the class workspace sub-views, which
 * surface in the sidebar while a class is open.
 */
export function PortalShell() {
  const { activeView, currentUser, supabase } = useAuth();

  const [instructorTab, setInstructorTab] = useState<InstructorViewTab>("today");
  const [adminTab, setAdminTab] = useState<AdminTab>("overview");
  const [studentTab, setStudentTab] = useState<StudentTab>("today");

  // Instructor class list + open workspace state (shared with the sidebar)
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<AcademicClass | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("roster");
  const [autoLaunchRollCall, setAutoLaunchRollCall] = useState(false);
  const [autoLaunchGradingToday, setAutoLaunchGradingToday] = useState(false);

  const isWorkspaceOpen = activeView === "instructor" && selectedClass !== null;

  const loadClasses = useCallback(async () => {
    if (!supabase || !currentUser) return;
    setIsLoadingClasses(true);
    setClassesError(null);
    try {
      setClasses(await listVisibleClasses(supabase));
    } catch (err) {
      setClassesError(
        err instanceof Error ? err.message : "Unable to load your classes."
      );
    } finally {
      setIsLoadingClasses(false);
    }
  }, [supabase, currentUser]);

  // Load the instructor's classes whenever the instructor POV becomes active.
  useEffect(() => {
    if (activeView !== "instructor") return;
    queueMicrotask(() => {
      void loadClasses();
    });
  }, [activeView, loadClasses]);

  // Close the class workspace when leaving the instructor POV. Adjusting state
  // during render (guarded by a previous-value check) avoids a cascading effect.
  const [prevActiveView, setPrevActiveView] = useState(activeView);
  if (prevActiveView !== activeView) {
    setPrevActiveView(activeView);
    if (activeView !== "instructor" && selectedClass) {
      setSelectedClass(null);
      setWorkspaceTab("roster");
      setAutoLaunchRollCall(false);
      setAutoLaunchGradingToday(false);
    }
  }

  const openClass = (cls: AcademicClass, options: OpenClassOptions = {}) => {
    setSelectedClass(cls);
    setWorkspaceTab(options.tab ?? "roster");
    setAutoLaunchRollCall(Boolean(options.rollCall));
    setAutoLaunchGradingToday(Boolean(options.gradingToday));
  };

  const closeClass = () => {
    setSelectedClass(null);
    setWorkspaceTab("roster");
    setAutoLaunchRollCall(false);
    setAutoLaunchGradingToday(false);
  };

  const handleCreateClass = async (input: CreateClassInput) => {
    if (!supabase || !currentUser) {
      throw new Error("You must be signed in to create a class.");
    }
    const created = await createClass(supabase, currentUser.id, input);
    setClasses((prev) => [created, ...prev]);
    openClass(created);
  };

  const currentTabId = isWorkspaceOpen
    ? workspaceTab
    : activeView === "instructor"
    ? instructorTab
    : activeView === "admin"
    ? adminTab
    : studentTab;

  const handleTabChange = (tabId: string) => {
    if (isWorkspaceOpen) {
      setWorkspaceTab(tabId as WorkspaceTab);
      return;
    }
    if (activeView === "instructor") {
      setInstructorTab(tabId as InstructorViewTab);
    } else if (activeView === "admin") {
      setAdminTab(tabId as AdminTab);
    } else if (activeView === "student") {
      setStudentTab(tabId as StudentTab);
    }
  };

  const workspaceNavItems: SidebarNavItem[] | undefined = isWorkspaceOpen
    ? WORKSPACE_TABS.map((t) => ({
        id: t.id,
        label: t.label,
        icon: t.icon,
      }))
    : undefined;

  const workspaceHeader = isWorkspaceOpen && selectedClass ? (
    <div className="space-y-3">
      <button
        type="button"
        onClick={closeClass}
        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-[#7C1D26] transition cursor-pointer whitespace-nowrap"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Classes</span>
      </button>
      <div className="min-w-0">
        <span className="inline-block text-[11px] font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2 py-0.5 rounded border border-[#7C1D26]/20 whitespace-nowrap">
          {selectedClass.courseCode} • {selectedClass.section}
        </span>
        <p className="text-sm font-bold text-zinc-950 mt-1.5 truncate">
          {selectedClass.courseTitle}
        </p>
      </div>
    </div>
  ) : undefined;

  const transitionKey = isWorkspaceOpen
    ? `${activeView}-${selectedClass?.id}-${workspaceTab}`
    : `${activeView}-${currentTabId}`;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#EAEAEF]">
      <Sidebar
        items={workspaceNavItems}
        header={workspaceHeader}
        activeTabId={currentTabId}
        onTabChange={handleTabChange}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0 bg-white">
        {currentUser?.isSuspended && (
          <SuspensionNoticeBanner
            userRole={currentUser.activeView}
            userName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}
          />
        )}

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <StaggeredView transitionKey={transitionKey} blockCount={5}>
            {isWorkspaceOpen && selectedClass ? (
              <ClassWorkspace
                academicClass={selectedClass}
                activeTab={workspaceTab}
                autoLaunchRollCall={autoLaunchRollCall}
                autoLaunchGradingToday={autoLaunchGradingToday}
              />
            ) : (
              <>
                {activeView === "instructor" && (
                  <InstructorHub
                    activeTab={instructorTab}
                    classes={classes}
                    isLoading={isLoadingClasses}
                    errorMessage={classesError}
                    onCreateClass={handleCreateClass}
                    onOpenClass={openClass}
                  />
                )}
                {activeView === "admin" && (
                  <AdminHub activeTab={adminTab} />
                )}
                {activeView === "student" && (
                  <StudentHub activeTab={studentTab} />
                )}
              </>
            )}
          </StaggeredView>
        </main>

        <footer className="w-full border-t border-zinc-100 py-6 px-4 md:px-8 text-center text-xs text-zinc-400">
          <p className="truncate">
            AcademiaTrack • Digital Class Record &amp; Attendance System •
            University Academic Suite
          </p>
        </footer>
      </div>

      {currentUser?.mustResetPassword && (
        <FirstTimePasswordModal isOpen={true} />
      )}
    </div>
  );
}

export default PortalShell;
