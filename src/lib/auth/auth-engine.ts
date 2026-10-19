/**
 * Authentication Engine (client-side mock)
 *
 * Pure validation and code-generation helpers backing the public Landing Page,
 * Login, Student Registration, and OTP Password Reset flow. Kept free of React
 * so it can be unit tested directly and reused by the auth context.
 */

export type AuthScreen = "landing" | "login" | "register" | "forgot";

/** Shared demo credential for the pre-seeded academic personas. */
export const DEMO_PASSWORD = "Academia2026!";

/** Length of the one-time password emailed for password resets. */
export const OTP_LENGTH = 6;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." };
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must include both letters and numbers.",
    };
  }
  return { valid: true };
}

/** University student numbers follow the YYYY-NNNNN format (e.g. 2024-10492). */
export function validateStudentNumber(studentNumber: string): boolean {
  return /^\d{4}-\d{4,6}$/.test(studentNumber.trim());
}

/** Generates a numeric one-time password of the configured length. */
export function generateOtp(length: number = OTP_LENGTH): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export function validateOtp(input: string, expected: string): boolean {
  return input.trim() === expected.trim();
}

/** Masks an email for display, e.g. "elena.vance@u.edu" -> "el***@u.edu". */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
}
