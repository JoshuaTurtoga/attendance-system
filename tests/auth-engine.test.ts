import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeEmail,
  validateEmail,
  isUniversityEmail,
  validatePassword,
  validateStudentNumber,
  maskEmail,
  friendlyAuthError,
  UNIVERSITY_DEPARTMENTS,
  parseDepartment,
  formatDepartment,
} from "../src/lib/auth/auth-engine.ts";
import {
  checkEmailRegistered,
  clearEmailCheckCache,
} from "../src/lib/data/profiles.ts";

test("Auth Engine: normalizeEmail trims and lowercases the address", () => {
  assert.equal(normalizeEmail("  Elena.Vance@University.EDU "), "elena.vance@university.edu");
});

test("Auth Engine: validateEmail accepts well-formed addresses and rejects malformed ones", () => {
  assert.equal(validateEmail("arthur.pendelton@university.edu"), true);
  assert.equal(validateEmail("student@student.university.edu"), true);
  assert.equal(validateEmail("not-an-email"), false);
  assert.equal(validateEmail("missing@domain"), false);
  assert.equal(validateEmail(""), false);
});

test("Auth Engine: isUniversityEmail enforces the official domain", () => {
  assert.equal(isUniversityEmail("student@universityofbohol.edu.ph"), true);
  assert.equal(isUniversityEmail("STUDENT@UNIVERSITYOFBOHOL.EDU.PH"), true);
  assert.equal(isUniversityEmail("student@gmail.com"), false);
  assert.equal(isUniversityEmail("faculty@universityofbohol.edu.ph"), true);
});

test("Auth Engine: validatePassword enforces length and mixed character classes", () => {
  assert.equal(validatePassword("short1").valid, false);
  assert.equal(validatePassword("alllettersonly").valid, false);
  assert.equal(validatePassword("12345678").valid, false);
  assert.equal(validatePassword("Academia2026!").valid, true);
});

test("Auth Engine: validateStudentNumber accepts student numbers without strict format restrictions", () => {
  assert.equal(validateStudentNumber("2024-10492"), true);
  assert.equal(validateStudentNumber("2024-101010"), true);
  assert.equal(validateStudentNumber("2410492"), true);
  assert.equal(validateStudentNumber("2024-104"), true);
  assert.equal(validateStudentNumber("10492"), true);
  assert.equal(validateStudentNumber("S-12345"), true);
  assert.equal(validateStudentNumber(""), false);
  assert.equal(validateStudentNumber("   "), false);
});

test("Auth Engine: maskEmail hides the local part beyond the first two characters", () => {
  assert.equal(maskEmail("elena.vance@university.edu"), "el*********@university.edu");
  assert.equal(maskEmail("no-domain"), "no-domain");
});

test("Auth Engine: UNIVERSITY_DEPARTMENTS defines the 11 official departments with separated names and abbreviations", () => {
  assert.equal(UNIVERSITY_DEPARTMENTS.length, 11);
  const cba = UNIVERSITY_DEPARTMENTS.find((d) => d.code === "CBA");
  assert.ok(cba);
  assert.equal(cba?.name, "College of Business and Accountancy");
  assert.equal(cba?.code, "CBA");

  const vdtalc = UNIVERSITY_DEPARTMENTS.find((d) => d.code === "VDTALC");
  assert.ok(vdtalc);
  assert.equal(vdtalc?.name, "Victoriano D. Tirol Advanced Learning Center");
});

test("Auth Engine: parseDepartment splits department into full name and abbreviation across formats", () => {
  // Colon format
  assert.deepEqual(parseDepartment("College of Business and Accountancy: CBA"), {
    name: "College of Business and Accountancy",
    code: "CBA",
  });

  // Parentheses format
  assert.deepEqual(parseDepartment("College of Law (COL)"), {
    name: "College of Law",
    code: "COL",
  });

  // Full name only
  assert.deepEqual(parseDepartment("College of Criminal Justice"), {
    name: "College of Criminal Justice",
    code: "CCJ",
  });

  // Code only
  assert.deepEqual(parseDepartment("CETAFA"), {
    name: "College of Engineering, Technology, Architecture, and Fine Arts",
    code: "CETAFA",
  });

  // Custom or unknown fallback
  assert.deepEqual(parseDepartment("Computer Science"), {
    name: "Computer Science",
    code: "CS",
  });

  // Empty or undefined
  assert.deepEqual(parseDepartment(""), { name: "", code: "" });
  assert.deepEqual(parseDepartment(null), { name: "", code: "" });
});

test("Auth Engine: formatDepartment supports full, short (abbreviation), and both modes", () => {
  const dept = "College of Pharmacy: COP";
  assert.equal(formatDepartment(dept, "full"), "College of Pharmacy");
  assert.equal(formatDepartment(dept, "short"), "COP");
  assert.equal(formatDepartment(dept, "both"), "College of Pharmacy (COP)");
});

test("Auth Engine: friendlyAuthError maps raw database & auth errors to readable messages", () => {
  // Duplicate email / user already exists variants
  const expectedDuplicateMsg =
    "An account with this university email already exists. Please sign in or reset your password.";
  assert.equal(friendlyAuthError("User already registered"), expectedDuplicateMsg);
  assert.equal(
    friendlyAuthError("duplicate key value violates unique constraint \"profiles_email_key\""),
    expectedDuplicateMsg
  );
  assert.equal(friendlyAuthError("A user with this email already exists"), expectedDuplicateMsg);
  assert.equal(friendlyAuthError("Email already in use"), expectedDuplicateMsg);

  // Invalid login credentials
  assert.equal(
    friendlyAuthError("Invalid login credentials"),
    "Incorrect email or password. Please try again."
  );

  // Email confirmation
  assert.equal(
    friendlyAuthError("Email not confirmed"),
    "Please confirm your university email before signing in."
  );

  // Unknown / unmapped error preserved as-is
  assert.equal(
    friendlyAuthError("Network timeout connecting to authentication server"),
    "Network timeout connecting to authentication server"
  );
});

test("Auth Engine: checkEmailRegistered short-circuits empty emails without database calls", async () => {
  clearEmailCheckCache();
  let rpcCalls = 0;
  const mockClient = {
    rpc: async () => {
      rpcCalls++;
      return { data: false, error: null };
    },
  } as unknown as import("@supabase/supabase-js").SupabaseClient;

  assert.equal(await checkEmailRegistered(mockClient, ""), false);
  assert.equal(await checkEmailRegistered(mockClient, "   "), false);
  assert.equal(rpcCalls, 0);
});

test("Auth Engine: checkEmailRegistered uses in-memory session cache to eliminate duplicate DB queries", async () => {
  clearEmailCheckCache();
  let rpcCalls = 0;
  const queriedParams: Array<{ p_email: string }> = [];

  const mockClient = {
    rpc: async (fn: string, params: { p_email: string }) => {
      rpcCalls++;
      queriedParams.push(params);
      if (params.p_email === "registered@universityofbohol.edu.ph") {
        return { data: true, error: null };
      }
      return { data: false, error: null };
    },
  } as unknown as import("@supabase/supabase-js").SupabaseClient;

  // First call for existing email: calls RPC
  const exists1 = await checkEmailRegistered(mockClient, "REGISTERED@universityofbohol.edu.ph");
  assert.equal(exists1, true);
  assert.equal(rpcCalls, 1);
  assert.deepEqual(queriedParams[0], { p_email: "registered@universityofbohol.edu.ph" });

  // Repeated call for same email (different casing/whitespace): served from cache, NO DB call
  const exists2 = await checkEmailRegistered(mockClient, "  registered@universityofbohol.edu.ph  ");
  assert.equal(exists2, true);
  assert.equal(rpcCalls, 1, "Should not make a second RPC call due to in-memory session cache");

  // Call for available email: calls RPC once and caches
  const exists3 = await checkEmailRegistered(mockClient, "newstudent@universityofbohol.edu.ph");
  assert.equal(exists3, false);
  assert.equal(rpcCalls, 2);

  // Repeated call for available email: served from cache
  const exists4 = await checkEmailRegistered(mockClient, "newstudent@universityofbohol.edu.ph");
  assert.equal(exists4, false);
  assert.equal(rpcCalls, 2, "Should be served from cache without incrementing RPC calls");

  // Cache clear forces a fresh query
  clearEmailCheckCache();
  const exists5 = await checkEmailRegistered(mockClient, "newstudent@universityofbohol.edu.ph");
  assert.equal(exists5, false);
  assert.equal(rpcCalls, 3, "After clearEmailCheckCache, lookup queries RPC again");
});

test("Auth Engine: checkEmailRegistered falls back gracefully to table query if RPC errors", async () => {
  clearEmailCheckCache();
  let tableSelectCalled = false;

  const mockClient = {
    rpc: async () => {
      return { data: null, error: { message: "function check_email_exists does not exist" } };
    },
    from: (table: string) => {
      assert.equal(table, "profiles");
      return {
        select: (cols: string) => {
          assert.equal(cols, "id");
          return {
            eq: (field: string, val: string) => {
              assert.equal(field, "email");
              assert.equal(val, "fallback@universityofbohol.edu.ph");
              return {
                limit: (lim: number) => {
                  assert.equal(lim, 1);
                  tableSelectCalled = true;
                  return Promise.resolve({ data: [{ id: "usr_123" }], error: null });
                },
              };
            },
          };
        },
      };
    },
  } as unknown as import("@supabase/supabase-js").SupabaseClient;

  const exists = await checkEmailRegistered(mockClient, "fallback@universityofbohol.edu.ph");
  assert.equal(exists, true);
  assert.equal(tableSelectCalled, true);
});


