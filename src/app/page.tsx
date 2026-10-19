"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/features/auth/auth-context";
import {
  InstructorHub,
  type InstructorViewTab,
} from "@/components/instructor-hub";
import { AdminHub, type AdminTab } from "@/components/admin-hub";
import { StudentHub, type StudentTab } from "@/components/student-hub";
import { StaggeredView } from "@/components/staggered-view";

export default function HomePage() {
  const { activeView } = useAuth();

  const [instructorTab, setInstructorTab] =
    useState<InstructorViewTab>("today");
  const [adminTab, setAdminTab] = useState<AdminTab>("overview");
  const [studentTab, setStudentTab] = useState<StudentTab>("today");

  const currentTabId =
    activeView === "instructor"
      ? instructorTab
      : activeView === "admin"
      ? adminTab
      : studentTab;

  const handleTabChange = (tabId: string) => {
    if (activeView === "instructor") {
      setInstructorTab(tabId as InstructorViewTab);
    } else if (activeView === "admin") {
      setAdminTab(tabId as AdminTab);
    } else if (activeView === "student") {
      setStudentTab(tabId as StudentTab);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#EAEAEF]">
      {/* Curved Cutout Sidebar Navigation */}
      <Sidebar
        activeTabId={currentTabId}
        onTabChange={handleTabChange}
      />

      {/* Adjacent White Content Panel (meets the active tab bulge seamlessly) */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
          <StaggeredView
            transitionKey={`${activeView}-${currentTabId}`}
            blockCount={5}
          >
            {activeView === "instructor" && (
              <InstructorHub
                activeTab={instructorTab}
                onTabChange={setInstructorTab}
              />
            )}
            {activeView === "admin" && (
              <AdminHub
                activeTab={adminTab}
                onTabChange={setAdminTab}
              />
            )}
            {activeView === "student" && (
              <StudentHub
                activeTab={studentTab}
                onTabChange={setStudentTab}
              />
            )}
          </StaggeredView>
        </main>

        <footer className="w-full border-t border-zinc-100 py-6 px-4 md:px-8 text-center text-xs text-zinc-400">
          <p>
            AcademiaTrack • Digital Class Record & Attendance System • University Academic Suite
          </p>
        </footer>
      </div>
    </div>
  );
}
