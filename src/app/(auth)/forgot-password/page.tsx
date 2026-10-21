"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { AuthOtpResetScreen } from "@/components/auth-otp-reset-screen";
import { getRoleDefaultRoute } from "@/lib/routing/routes";

export default function ForgotPasswordPage() {
  const { isAuthenticated, isLoading, activeView } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(getRoleDefaultRoute(activeView));
    }
  }, [isLoading, isAuthenticated, activeView, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return <AuthOtpResetScreen />;
}
