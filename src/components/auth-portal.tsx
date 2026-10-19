"use client";

import React from "react";
import { useAuth } from "@/features/auth/auth-context";
import { LandingPage } from "./landing-page";
import { AuthLoginScreen } from "./auth-login-screen";
import { AuthRegisterScreen } from "./auth-register-screen";
import { AuthOtpResetScreen } from "./auth-otp-reset-screen";

/**
 * Public authentication entry point. Renders the landing page and the
 * login / student registration / OTP password reset screens before the
 * authenticated role portals become reachable.
 */
export function AuthPortal() {
  const { authScreen } = useAuth();

  switch (authScreen) {
    case "login":
      return <AuthLoginScreen />;
    case "register":
      return <AuthRegisterScreen />;
    case "forgot":
      return <AuthOtpResetScreen />;
    case "landing":
    default:
      return <LandingPage />;
  }
}

export default AuthPortal;
