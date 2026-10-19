"use client";

import React, { createContext, useContext, useState } from "react";
import type { Role, UserProfile } from "@/types";
import { getAvailableViews, switchActiveView } from "@/lib/auth/permissions";
import {
  DEMO_PASSWORD,
  generateOtp,
  normalizeEmail,
  validateEmail,
  validateOtp,
  validatePassword,
  type AuthScreen,
} from "@/lib/auth/auth-engine";

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

interface RegisteredAccount {
  user: UserProfile;
  password: string;
}

export interface StudentRegistrationInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  studentNumber: string;
  email: string;
  password: string;
  department: string;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  currentUser: UserProfile;
  activeView: Role;
  availableViews: Role[];
  isDualRole: boolean;
  switchView: (view: Role) => void;
  selectPersona: (personaKey: keyof typeof DEMO_USERS) => void;
  activePersonaKey: string;

  // Public landing + authentication flow
  isAuthenticated: boolean;
  authScreen: AuthScreen;
  demoPassword: string;
  goToScreen: (screen: AuthScreen) => void;
  signIn: (email: string, password: string) => AuthResult;
  signOut: () => void;
  registerStudent: (input: StudentRegistrationInput) => AuthResult;
  requestPasswordResetOtp: (email: string) => AuthResult & { otp?: string };
  verifyPasswordResetOtp: (email: string, code: string) => AuthResult;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => AuthResult;
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

  // Accounts created through Student Registration, plus password overrides
  // applied to the pre-seeded demo personas via the OTP reset flow.
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>([]);
  const [passwordOverrides, setPasswordOverrides] = useState<Record<string, string>>({});
  const [registeredUser, setRegisteredUser] = useState<UserProfile | null>(null);

  const currentUser =
    registeredUser ?? DEMO_USERS[activePersonaKey] ?? DEMO_USERS.dual_instructor_admin;
  const [activeView, setActiveView] = useState<Role>(currentUser.activeView);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>("landing");
  const [otpStore, setOtpStore] = useState<Record<string, string>>({});

  const availableViews = getAvailableViews(currentUser.roles);
  const isDualRole = availableViews.length > 1;

  const findAccount = (
    email: string
  ): { user: UserProfile; password: string; personaKey?: string } | null => {
    const normalized = normalizeEmail(email);

    const registered = registeredAccounts.find(
      (a) => normalizeEmail(a.user.email) === normalized
    );
    if (registered) {
      return { user: registered.user, password: registered.password };
    }

    const demoEntry = Object.entries(DEMO_USERS).find(
      ([, u]) => normalizeEmail(u.email) === normalized
    );
    if (demoEntry) {
      const [key, user] = demoEntry;
      return {
        user,
        password: passwordOverrides[normalized] ?? DEMO_PASSWORD,
        personaKey: key,
      };
    }

    return null;
  };

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
    setRegisteredUser(null);
    setActivePersonaKey(key);
    setActiveView(user.activeView);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_persona_key", key);
    }
  };

  const goToScreen = (screen: AuthScreen) => setAuthScreen(screen);

  const signIn = (email: string, password: string): AuthResult => {
    if (!validateEmail(email)) {
      return { ok: false, error: "Please enter a valid email address." };
    }

    const account = findAccount(email);
    if (!account) {
      return { ok: false, error: "No account found for that email address." };
    }
    if (account.user.isSuspended) {
      return {
        ok: false,
        error: "This account has been suspended. Contact the registrar.",
      };
    }
    if (account.password !== password) {
      return { ok: false, error: "Incorrect password. Please try again." };
    }

    if (account.personaKey) {
      setRegisteredUser(null);
      setActivePersonaKey(account.personaKey);
      if (typeof window !== "undefined") {
        localStorage.setItem("active_persona_key", account.personaKey);
      }
    } else {
      setRegisteredUser(account.user);
    }
    setActiveView(account.user.activeView);
    setIsAuthenticated(true);
    return { ok: true };
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setRegisteredUser(null);
    setAuthScreen("landing");
  };

  const registerStudent = (input: StudentRegistrationInput): AuthResult => {
    const normalized = normalizeEmail(input.email);
    if (!validateEmail(input.email)) {
      return { ok: false, error: "Please enter a valid email address." };
    }
    if (findAccount(normalized)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const passwordCheck = validatePassword(input.password);
    if (!passwordCheck.valid) {
      return { ok: false, error: passwordCheck.message };
    }

    const newUser: UserProfile = {
      id: `usr_stud_${Date.now()}`,
      email: normalized,
      firstName: input.firstName.trim(),
      middleName: input.middleName?.trim() || undefined,
      lastName: input.lastName.trim(),
      studentNumber: input.studentNumber.trim(),
      roles: ["student"],
      activeView: "student",
      department: input.department,
      createdAt: new Date().toISOString(),
    };

    setRegisteredAccounts((prev) => [...prev, { user: newUser, password: input.password }]);
    setRegisteredUser(newUser);
    setActiveView("student");
    setIsAuthenticated(true);
    return { ok: true };
  };

  const requestPasswordResetOtp = (
    email: string
  ): AuthResult & { otp?: string } => {
    if (!validateEmail(email)) {
      return { ok: false, error: "Please enter a valid email address." };
    }
    const normalized = normalizeEmail(email);
    if (!findAccount(normalized)) {
      return { ok: false, error: "No account found for that email address." };
    }
    const otp = generateOtp();
    setOtpStore((prev) => ({ ...prev, [normalized]: otp }));
    return { ok: true, otp };
  };

  const verifyPasswordResetOtp = (email: string, code: string): AuthResult => {
    const normalized = normalizeEmail(email);
    const issued = otpStore[normalized];
    if (!issued) {
      return { ok: false, error: "Please request a new verification code." };
    }
    if (!validateOtp(code, issued)) {
      return { ok: false, error: "Incorrect verification code. Please try again." };
    }
    return { ok: true };
  };

  const resetPassword = (
    email: string,
    code: string,
    newPassword: string
  ): AuthResult => {
    const verification = verifyPasswordResetOtp(email, code);
    if (!verification.ok) return verification;

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return { ok: false, error: passwordCheck.message };
    }

    const normalized = normalizeEmail(email);
    setPasswordOverrides((prev) => ({ ...prev, [normalized]: newPassword }));
    setRegisteredAccounts((prev) =>
      prev.map((a) =>
        normalizeEmail(a.user.email) === normalized
          ? { ...a, password: newPassword }
          : a
      )
    );
    setOtpStore((prev) => {
      const next = { ...prev };
      delete next[normalized];
      return next;
    });
    setAuthScreen("login");
    return { ok: true };
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
        isAuthenticated,
        authScreen,
        demoPassword: DEMO_PASSWORD,
        goToScreen,
        signIn,
        signOut,
        registerStudent,
        requestPasswordResetOtp,
        verifyPasswordResetOtp,
        resetPassword,
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
