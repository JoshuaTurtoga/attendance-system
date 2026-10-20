/**
 * Authentication Engine
 *
 * Pure validation helpers backing the public Landing Page, Login, Student
 * Registration and Password Reset flow. Kept free of React so it can be unit
 * tested directly and reused by the auth context.
 */

export type AuthScreen = "landing" | "login" | "register" | "forgot";

/** Length of the one-time password issued for password resets. */
export const OTP_LENGTH = 6;

/** The only email domain students may register with. */
export const UNIVERSITY_EMAIL_DOMAIN = "universityofbohol.edu.ph";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Strict domain verification: student accounts are limited to the official
 * university email domain. Personal providers (Gmail, Yahoo, ...) are blocked.
 */
export function isUniversityEmail(email: string): boolean {
  return normalizeEmail(email).endsWith(`@${UNIVERSITY_EMAIL_DOMAIN}`);
}

export function universityEmailErrorMessage(): string {
  return `Student registration is restricted to the official university email domain (@${UNIVERSITY_EMAIL_DOMAIN}).`;
}

/**
 * Academic departments offered at registration. Mirrors the department list
 * seeded into `system_policies` so the registrar can keep both in step.
 */
export const DEPARTMENTS = [
  "Graduate School: GS",
  "College of Law: COL",
  "College of Business and Accountancy: CBA",
  "College of Engineering, Technology, Architecture, and Fine Arts: CETAFA",
  "College of Arts, Sciences, and Education: CASE",
  "College of Criminal Justice: CCJ",
  "College of Hospitality Management, Tourism, and Nutrition: CHMTN",
  "College of Allied Health Sciences: CAHS",
  "College of Physical Therapy and Occupational Therapy: CPTOT",
  "College of Pharmacy: COP",
  "Victoriano D. Tirol Advanced Learning Center: VDTALC",
] as const;

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

/** Masks an email for display, e.g. "elena.vance@u.edu" -> "el***@u.edu". */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
}
