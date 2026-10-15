"use client";

import React, { createContext, useContext, useState } from "react";
import type { Role, UserProfile } from "@/types";
import { getAvailableViews, switchActiveView } from "@/lib/auth/permissions";

// Default demo personas to immediately test all roles and POV switching
export const DEMO_USERS: Record<string, UserProfile> = {
  dual_instructor_admin: {
    id: "usr_dual_01",
    email: "arthur.pendelton@university.edu",
    firstName: "Arthur",
    middleName: "M.",
    lastName: "Pendelton",
    roles: ["instructor", "admin"],
    activeView: "instructor",
    department: "Computer Science & Engineering",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  instructor_only: {
    id: "usr_inst_02",
    email: "elena.vance@university.edu",
    firstName: "Elena",
    middleName: "R.",
    lastName: "Vance",
    roles: ["instructor"],
    activeView: "instructor",
    department: "College of Science",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  student_only: {
    id: "usr_stud_03",
    email: "marcus.chen@student.university.edu",
    firstName: "Marcus",
    middleName: "L.",
    lastName: "Chen",
    studentNumber: "2024-10492",
    roles: ["student"],
    activeView: "student",
    department: "College of Computer Studies",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
};

interface AuthContextType {
  currentUser: UserProfile;
  activeView: Role;
  availableViews: Role[];
  isDualRole: boolean;
  switchView: (view: Role) => void;
  selectPersona: (personaKey: keyof typeof DEMO_USERS) => void;
  activePersonaKey: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [activePersonaKey, setActivePersonaKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("active_persona_key");
      if (saved && DEMO_USERS[saved]) return saved;
    }
    return "dual_instructor_admin";
  });

  const currentUser = DEMO_USERS[activePersonaKey] || DEMO_USERS.dual_instructor_admin;
  const [activeView, setActiveView] = useState<Role>(currentUser.activeView);

  const availableViews = getAvailableViews(currentUser.roles);
  const isDualRole = availableViews.length > 1;

  const handleSwitchView = (targetView: Role) => {
    try {
      const validated = switchActiveView(currentUser.roles, targetView);
      setActiveView(validated);
    } catch (err) {
      console.error("Failed to switch view:", err);
    }
  };

  const handleSelectPersona = (key: keyof typeof DEMO_USERS) => {
    const user = DEMO_USERS[key];
    if (!user) return;
    setActivePersonaKey(key);
    setActiveView(user.activeView);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_persona_key", key);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeView,
        availableViews,
        isDualRole,
        switchView: handleSwitchView,
        selectPersona: handleSelectPersona,
        activePersonaKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
