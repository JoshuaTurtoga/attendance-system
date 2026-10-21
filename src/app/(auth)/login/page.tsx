"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { AuthLoginScreen } from "@/components/auth-login-screen";
import { getRoleDefaultRoute } from "@/lib/routing/routes";

export default function LoginPage() {
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

  return (
    <Suspense fallback={null}>
      <AuthLoginScreen />
    </Suspense>
  );
}
