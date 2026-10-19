"use client";

import React from "react";
import { useAuth } from "@/features/auth/auth-context";
import { AuthPortal } from "@/components/auth-portal";
import { PortalShell } from "@/components/portal-shell";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  // Public landing page + authentication flow gate every role portal.
  if (!isAuthenticated) {
    return <AuthPortal />;
  }

  return <PortalShell />;
}
