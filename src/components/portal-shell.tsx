"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import {
  ClassWorkspace,
  type WorkspaceTab,
} from "@/components/class-workspace";
import {
  createClass as apiCreateClass,
  listVisibleClasses,
  type CreateClassInput,
} from "@/lib/data/classes";
import { appCache } from "@/lib/cache/data-cache";
import {
  parsePortalPathname,
  isAuthorizedForRoute,
  setLastActivePath,
  getRoleDefaultRoute,
} from "@/lib/routing/routes";
import { FirstTimePasswordModal } from "./first-time-password-modal";
import { SuspensionNoticeBanner } from "./suspension-notice-banner";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  TrendingUp,
  FileText,
  GraduationCap,
} from "lucide-react";

export interface OpenClassOptions {
  tab?: WorkspaceTab;
  rollCall?: boolean;
  gradingToday?: boolean;
}

export interface PortalContextValue {
  classes: AcademicClass[];
  isLoadingClasses: boolean;
  classesError: string | null;
  loadClasses: () => Promise<void>;
  createClass: (input: CreateClassInput) => Promise<void>;
  selectedClass: AcademicClass | null;
  openClass: (cls: AcademicClass, options?: OpenClassOptions) => void;
  closeClass: () => void;
}

const PortalContext = createContext<PortalContextValue | null>(null);

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) {
    throw new Error("usePortal must be used within a PortalShell");
  }
  return ctx;
}

const WORKSPACE_TABS: {
  id: WorkspaceTab;
  label: string;
  icon: React.ReactNode;
}[] = [
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

export interface PortalShellProps {
  children?: React.ReactNode;
}

/**
 * Authenticated portal shell. The curved sidebar is the single navigation
 * control for every role — including the class workspace sub-views, which
 * surface in the sidebar while a class is open.
 */
export function PortalShell({ children }: PortalShellProps) {
  const { activeView, currentUser, supabase, isAuthenticated, isLoading } =
    useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Instructor class list + open workspace state
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  // Tab fallbacks for in-memory/direct rendering
  const [fallbackInstructorTab, setFallbackInstructorTab] =
    useState<InstructorViewTab>("today");
  const [fallbackAdminTab, setFallbackAdminTab] = useState<AdminTab>("overview");
  const [fallbackStudentTab, setFallbackStudentTab] =
    useState<StudentTab>("today");
  const [fallbackSelectedClass, setFallbackSelectedClass] =
    useState<AcademicClass | null>(null);
  const [fallbackWorkspaceTab, setFallbackWorkspaceTab] =
    useState<WorkspaceTab>("roster");
  const [autoLaunchRollCall, setAutoLaunchRollCall] = useState(false);
  const [autoLaunchGradingToday, setAutoLaunchGradingToday] = useState(false);

  // Parse current route pathname
  const parsedPath = parsePortalPathname(pathname || "/");

  // Load instructor classes whenever instructor view is active
  const loadClasses = useCallback(async () => {
    if (!supabase || !currentUser) return;
    const cached = appCache.get<AcademicClass[]>("visible_classes");
    if (cached) {
      setClasses(cached);
    } else {
      setIsLoadingClasses(true);
    }
    setClassesError(null);
    try {
      const data = await listVisibleClasses(supabase);
      setClasses(data);
    } catch (err) {
      if (!cached) {
        setClassesError(
          err instanceof Error ? err.message : "Unable to load your classes."
        );
      }
    } finally {
      setIsLoadingClasses(false);
    }
  }, [supabase, currentUser]);

  useEffect(() => {
    if (activeView !== "instructor") return;
    queueMicrotask(() => {
      void loadClasses();
    });
  }, [activeView, loadClasses]);

  // Session guard and role enforcement on navigation
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname || "/");
      router.replace(`/login?redirectTo=${returnUrl}`);
      return;
    }

    if (!isAuthorizedForRoute(activeView, pathname || "/")) {
      router.replace(getRoleDefaultRoute(activeView));
      return;
    }

    // Persist last active path for seamless reload / revisit
    if (pathname && pathname !== "/") {
      setLastActivePath(activeView, pathname);
    }
  }, [isLoading, isAuthenticated, activeView, pathname, router]);

  // Derive active class when in a workspace route
  const resolvedClass = parsedPath.isWorkspace && parsedPath.classId
    ? classes.find((c) => c.id === parsedPath.classId) || fallbackSelectedClass
    : fallbackSelectedClass;

  const isWorkspaceOpen =
    activeView === "instructor" &&
    (parsedPath.isWorkspace || resolvedClass !== null);

  const currentTabId = isWorkspaceOpen
    ? parsedPath.workspaceTab || fallbackWorkspaceTab
    : activeView === "instructor"
    ? parsedPath.tab === "schedule"
      ? "calendar"
      : ((parsedPath.tab as InstructorViewTab) || fallbackInstructorTab)
    : activeView === "admin"
    ? ((parsedPath.tab as AdminTab) || fallbackAdminTab)
    : ((parsedPath.tab as StudentTab) || fallbackStudentTab);

  const openClass = (cls: AcademicClass, options: OpenClassOptions = {}) => {
    setFallbackSelectedClass(cls);
    setFallbackWorkspaceTab(options.tab ?? "roster");
    setAutoLaunchRollCall(Boolean(options.rollCall));
    setAutoLaunchGradingToday(Boolean(options.gradingToday));

    const targetTab = options.tab ?? "roster";
    const queryParts: string[] = [];
    if (options.rollCall) queryParts.push("rollCall=true");
    if (options.gradingToday) queryParts.push("gradingToday=true");
    const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

    router.push(`/instructor/classes/${cls.id}/${targetTab}${query}`);
  };

  const closeClass = () => {
    setFallbackSelectedClass(null);
    setFallbackWorkspaceTab("roster");
    setAutoLaunchRollCall(false);
    setAutoLaunchGradingToday(false);
    router.push("/instructor/classes");
  };

  const handleCreateClass = async (input: CreateClassInput): Promise<void> => {
    if (!supabase || !currentUser) {
      throw new Error("You must be signed in to create a class.");
    }
    if (currentUser.isSuspended) {
      throw new Error(
        "Restricted Account: Suspended faculty accounts cannot create new classes."
      );
    }
    const created = await apiCreateClass(supabase, currentUser.id, input);
    setClasses((prev) => [created, ...prev]);
    openClass(created);
  };

  const handleTabChange = (tabId: string) => {
    if (isWorkspaceOpen && resolvedClass) {
      const dest = `/instructor/classes/${resolvedClass.id}/${tabId}`;
      if (pathname === dest) return;
      setFallbackWorkspaceTab(tabId as WorkspaceTab);
      router.push(dest);
      return;
    }

    if (activeView === "instructor") {
      const dest = tabId === "calendar" ? "/instructor/schedule" : `/instructor/${tabId}`;
      if (pathname === dest) return;
      setFallbackInstructorTab(tabId as InstructorViewTab);
      router.push(dest);
    } else if (activeView === "admin") {
      const dest = `/admin/${tabId}`;
      if (pathname === dest) return;
      setFallbackAdminTab(tabId as AdminTab);
      router.push(dest);
    } else if (activeView === "student") {
      const dest = `/student/${tabId}`;
      if (pathname === dest) return;
      setFallbackStudentTab(tabId as StudentTab);
      router.push(dest);
    }
  };

  // Build workspace navigation tabs with explicit links
  const workspaceNavItems: SidebarNavItem[] | undefined = isWorkspaceOpen
    ? WORKSPACE_TABS.map((t) => ({
        id: t.id,
        label: t.label,
        icon: t.icon,
        href: resolvedClass
          ? `/instructor/classes/${resolvedClass.id}/${t.id}`
          : undefined,
      }))
    : undefined;

  const workspaceHeader = isWorkspaceOpen && resolvedClass ? (
    <div className="space-y-3">
      <Link
        href="/instructor/classes"
        onClick={(e) => {
          e.preventDefault();
          closeClass();
        }}
        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-[#7C1D26] transition cursor-pointer whitespace-nowrap"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Classes</span>
      </Link>
      <div className="min-w-0">
        <span className="inline-block text-[11px] font-mono font-bold text-[#7C1D26] bg-[#7C1D26]/5 px-2 py-0.5 rounded border border-[#7C1D26]/20 whitespace-nowrap">
          {resolvedClass.courseCode} • {resolvedClass.section}
        </span>
        <p className="text-sm font-bold text-zinc-950 mt-1.5 truncate">
          {resolvedClass.courseTitle}
        </p>
      </div>
    </div>
  ) : undefined;

  const transitionKey = isWorkspaceOpen
    ? `${activeView}-${resolvedClass?.id}-${currentTabId}`
    : `${activeView}-${currentTabId}`;

  const contextValue: PortalContextValue = {
    classes,
    isLoadingClasses,
    classesError,
    loadClasses,
    createClass: handleCreateClass,
    selectedClass: resolvedClass,
    openClass,
    closeClass,
  };

  return (
    <PortalContext.Provider value={contextValue}>
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
            {isLoading ? (
              <div className="min-h-[400px] w-full flex flex-col items-center justify-center gap-4 bg-transparent">
                <div className="w-12 h-12 rounded-2xl bg-[#7C1D26] text-white flex items-center justify-center shadow-md shadow-[#7C1D26]/20">
                  <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 border-t-[#7C1D26] animate-spin" />
                  Restoring your session…
                </div>
              </div>
            ) : null}

            <div className={isLoading || !isAuthenticated ? "hidden" : undefined}>
              <StaggeredView transitionKey={transitionKey} blockCount={5}>
                {children ? (
                  children
                ) : isWorkspaceOpen && resolvedClass ? (
                  <ClassWorkspace
                    academicClass={resolvedClass}
                    activeTab={currentTabId as WorkspaceTab}
                    autoLaunchRollCall={autoLaunchRollCall}
                    autoLaunchGradingToday={autoLaunchGradingToday}
                  />
                ) : (
                  <>
                    {activeView === "instructor" && (
                      <InstructorHub
                        activeTab={currentTabId as InstructorViewTab}
                        classes={classes}
                        isLoading={isLoadingClasses}
                        errorMessage={classesError}
                        onCreateClass={handleCreateClass}
                        onOpenClass={openClass}
                      />
                    )}
                    {activeView === "admin" && (
                      <AdminHub activeTab={currentTabId as AdminTab} />
                    )}
                    {activeView === "student" && (
                      <StudentHub activeTab={currentTabId as StudentTab} />
                    )}
                  </>
                )}
              </StaggeredView>
            </div>
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
    </PortalContext.Provider>
  );
}

export default PortalShell;
