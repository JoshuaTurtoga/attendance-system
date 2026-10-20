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

export interface DepartmentItem {
  name: string;
  code: string;
}

/**
 * Official academic departments and their abbreviations at the University of Bohol.
 * Separated to support responsive presentation: complete name on larger screens,
 * abbreviation only on mobile and compact views.
 */
export const UNIVERSITY_DEPARTMENTS: readonly DepartmentItem[] = [
  { name: "Graduate School", code: "GS" },
  { name: "College of Law", code: "COL" },
  { name: "College of Business and Accountancy", code: "CBA" },
  { name: "College of Engineering, Technology, Architecture, and Fine Arts", code: "CETAFA" },
  { name: "College of Arts, Sciences, and Education", code: "CASE" },
  { name: "College of Criminal Justice", code: "CCJ" },
  { name: "College of Hospitality Management, Tourism, and Nutrition", code: "CHMTN" },
  { name: "College of Allied Health Sciences", code: "CAHS" },
  { name: "College of Physical Therapy and Occupational Therapy", code: "CPTOT" },
  { name: "College of Pharmacy", code: "COP" },
  { name: "Victoriano D. Tirol Advanced Learning Center", code: "VDTALC" },
] as const;

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

/**
 * Parses any department input (raw name, abbreviation, colon-separated, or paren-formatted)
 * into a distinct full name and abbreviation.
 */
export function parseDepartment(raw?: string | null): { name: string; code: string } {
  if (!raw || !raw.trim()) {
    return { name: "", code: "" };
  }
  const trimmed = raw.trim();

  // 1. Exact match in UNIVERSITY_DEPARTMENTS by code or name
  const exact = UNIVERSITY_DEPARTMENTS.find(
    (d) =>
      d.code.toLowerCase() === trimmed.toLowerCase() ||
      d.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) {
    return { name: exact.name, code: exact.code };
  }

  // 2. Colon-separated format: "Name: Code"
  if (trimmed.includes(":")) {
    const [namePart, ...rest] = trimmed.split(":");
    const name = namePart.trim();
    const code = rest.join(":").trim();
    return { name, code: code || name };
  }

  // 3. Parentheses format: "Name (Code)"
  const parenMatch = trimmed.match(/^(.*?)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    return { name: parenMatch[1].trim(), code: parenMatch[2].trim() };
  }

  // 4. Substring match against known official departments
  const partial = UNIVERSITY_DEPARTMENTS.find(
    (d) =>
      trimmed.toLowerCase().includes(d.name.toLowerCase()) ||
      trimmed.toLowerCase().includes(d.code.toLowerCase())
  );
  if (partial) {
    return { name: partial.name, code: partial.code };
  }

  // 5. Fallback for custom or test departments (e.g. "Computer Science")
  const words = trimmed.split(/\s+/).filter(Boolean);
  const derivedCode =
    words.length > 1
      ? words.map((w) => w[0].toUpperCase()).join("")
      : trimmed;
  return { name: trimmed, code: derivedCode };
}

/**
 * Formats a department for full, short (abbreviation only), or combined presentation.
 */
export function formatDepartment(
  raw?: string | null,
  mode: "full" | "short" | "both" = "full"
): string {
  const { name, code } = parseDepartment(raw);
  if (!name && !code) return "";
  if (mode === "short") return code || name;
  if (mode === "both") return code ? `${name} (${code})` : name;
  return name || code;
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

/** Masks an email for display, e.g. "elena.vance@u.edu" -> "el***@u.edu". */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(1, local.length - 2))}@${domain}`;
}
