"use client";

import React from "react";
import { InstructorHub } from "@/components/instructor-hub";
import { usePortal } from "@/components/portal-shell";

export default function InstructorSchedulePage() {
  const { classes, isLoadingClasses, classesError, createClass, openClass } =
    usePortal();

  return (
    <InstructorHub
      activeTab="calendar"
      classes={classes}
      isLoading={isLoadingClasses}
      errorMessage={classesError}
      onCreateClass={createClass}
      onOpenClass={openClass}
    />
  );
}
