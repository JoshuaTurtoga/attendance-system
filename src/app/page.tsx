"use client";

import React from "react";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/features/auth/auth-context";
import { InstructorHub } from "@/components/instructor-hub";
import { AdminHub } from "@/components/admin-hub";
import { StudentHub } from "@/components/student-hub";

export default function HomePage() {
  const { activeView } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {activeView === "instructor" && <InstructorHub />}
        {activeView === "admin" && <AdminHub />}
        {activeView === "student" && <StudentHub />}
      </main>

      <footer className="w-full border-t border-zinc-200/80 py-6 px-4 md:px-8 text-center text-xs text-zinc-400">
        <p>
          AcademiaTrack • Digital Class Record & Attendance System • University Academic Suite
        </p>
      </footer>
    </div>
  );
}
