"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Role, UserProfile } from "@/types";
import { getAvailableViews, switchActiveView } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  fetchProfile,
  setActiveView as persistActiveView,
} from "@/lib/data/profiles";
import {
  isUniversityEmail,
  normalizeEmail,
  universityEmailErrorMessage,
  validateEmail,
  validatePassword,
  type AuthScreen,
} from "@/lib/auth/auth-engine";

export interface StudentRegistrationInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  studentNumber: string;
  email: string;
  password: string;
  department: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  supabase: SupabaseClient | null;
  isConfigured: boolean;
  isLoading: boolean;
  currentUser: UserProfile | null;
  activeView: Role;
  availableViews: Role[];
  isAuthenticated: boolean;

  authScreen: AuthScreen;
  authNotice: string | null;
  goToScreen: (screen: AuthScreen) => void;
  clearNotice: () => void;

  switchView: (view: Role) => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  registerStudent: (input: StudentRegistrationInput) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  verifyPasswordResetOtp: (email: string, code: string) => Promise<AuthResult>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Translates raw Supabase auth errors into student/faculty friendly copy. */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your university email before signing in.";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "An account with this email already exists.";
  }
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const configured = isSupabaseConfigured();

  const [isLoading, setIsLoading] = useState(Boolean(configured && supabase));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<Role>("student");
  const [authScreen, setAuthScreen] = useState<AuthScreen>("landing");
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const hydrateProfile = useCallback(
    async (client: SupabaseClient, userId: string): Promise<UserProfile | null> => {
      // The profile row is created by a DB trigger on sign-up; retry briefly
      // so a brand-new account is not shown as missing.
      for (let attempt = 0; attempt < 3; attempt++) {
        const profile = await fetchProfile(client, userId);
        if (profile) return profile;
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
      return null;
    },
    []
  );

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    const applyProfile = (profile: UserProfile | null) => {
      if (cancelled) return;
      setCurrentUser(profile);
      if (profile) {
        setActiveView(profile.activeView);
      }
    };

    void (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      if (user) {
        applyProfile(await hydrateProfile(supabase, user.id));
      }
      if (!cancelled) setIsLoading(false);
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session?.user) {
          applyProfile(null);
          return;
        }
        void hydrateProfile(supabase, session.user.id).then(applyProfile);
      }
    );

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [supabase, hydrateProfile]);

  const goToScreen = (screen: AuthScreen) => setAuthScreen(screen);
  const clearNotice = () => setAuthNotice(null);

  const handleSwitchView = (targetView: Role) => {
    if (!currentUser) return;
    try {
      const validated = switchActiveView(currentUser.roles, targetView);
      setActiveView(validated);
      if (supabase) {
        void persistActiveView(supabase, currentUser.id, validated);
      }
    } catch (err) {
      console.error("Failed to switch view:", err);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) {
      return { ok: false, error: "Supabase is not configured for this deployment." };
    }
    if (!validateEmail(email)) {
      return { ok: false, error: "Please enter a valid email address." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error) {
      return { ok: false, error: friendlyAuthError(error.message) };
    }

    const userId = data.user?.id;
    if (!userId) {
      return { ok: false, error: "Unable to sign in. Please try again." };
    }

    const profile = await hydrateProfile(supabase, userId);
    if (!profile) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error:
          "Account profile not found in the university database. If you just created this account, ensure a matching record exists in public.profiles with role 'admin'.",
      };
    }
    if (profile.isSuspended) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error: "This account has been suspended. Contact the registrar.",
      };
    }

    setCurrentUser(profile);
    setActiveView(profile.activeView ?? "student");
    return { ok: true };
  };

  const signOut = async (): Promise<void> => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setAuthScreen("landing");
  };

  const registerStudent = async (
    input: StudentRegistrationInput
  ): Promise<AuthResult> => {
    if (!supabase) {
      return { ok: false, error: "Supabase is not configured for this deployment." };
    }
    if (!validateEmail(input.email)) {
      return { ok: false, error: "Please enter a valid email address." };
    }
    if (!isUniversityEmail(input.email)) {
      return { ok: false, error: universityEmailErrorMessage() };
    }
    const passwordCheck = validatePassword(input.password);
    if (!passwordCheck.valid) {
      return { ok: false, error: passwordCheck.message };
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(input.email),
      password: input.password,
      options: {
        data: {
          role: "student",
          first_name: input.firstName.trim(),
          middle_name: input.middleName?.trim() ?? "",
          last_name: input.lastName.trim(),
          student_number: input.studentNumber.trim(),
          department: input.department,
        },
      },
    });

    if (error) {
      return { ok: false, error: friendlyAuthError(error.message) };
    }

    if (!data.session) {
      setAuthNotice(
        "Account created. Confirm your university email, then sign in to continue."
      );
      setAuthScreen("login");
      return { ok: true };
    }

    const profile = await hydrateProfile(supabase, data.session.user.id);
    setCurrentUser(profile);
    setActiveView("student");
    return { ok: true };
  };

  const requestPasswordReset = async (email: string): Promise<AuthResult> => {
    if (!supabase) {
      return { ok: false, error: "Supabase is not configured for this deployment." };
    }
    if (!validateEmail(email)) {
      return { ok: false, error: "Please enter a valid email address." };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizeEmail(email)
    );
    if (error) {
      return { ok: false, error: friendlyAuthError(error.message) };
    }
    return { ok: true };
  };

  const verifyPasswordResetOtp = async (
    email: string,
    code: string
  ): Promise<AuthResult> => {
    if (!supabase) {
      return { ok: false, error: "Supabase is not configured for this deployment." };
    }
    const { error } = await supabase.auth.verifyOtp({
      email: normalizeEmail(email),
      token: code.trim(),
      type: "recovery",
    });
    if (error) {
      return { ok: false, error: "Incorrect or expired verification code." };
    }
    return { ok: true };
  };

  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<AuthResult> => {
    if (!supabase) {
      return { ok: false, error: "Supabase is not configured for this deployment." };
    }
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return { ok: false, error: passwordCheck.message };
    }

    const verification = await verifyPasswordResetOtp(email, code);
    if (!verification.ok) return verification;

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { ok: false, error: friendlyAuthError(error.message) };
    }

    await supabase.auth.signOut();
    setAuthScreen("login");
    setAuthNotice("Password updated. Sign in with your new password.");
    return { ok: true };
  };

  const availableViews = currentUser ? getAvailableViews(currentUser.roles) : [];
  const isAuthenticated = currentUser !== null;

  return (
    <AuthContext.Provider
      value={{
        supabase,
        isConfigured: configured,
        isLoading,
        currentUser,
        activeView,
        availableViews,
        isAuthenticated,
        authScreen,
        authNotice,
        goToScreen,
        clearNotice,
        switchView: handleSwitchView,
        signIn,
        signOut,
        registerStudent,
        requestPasswordReset,
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
