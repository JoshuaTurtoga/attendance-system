"use client";

import React, { Suspense } from "react";
import { PortalShell } from "@/components/portal-shell";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <PortalShell>{children}</PortalShell>
    </Suspense>
  );
}
