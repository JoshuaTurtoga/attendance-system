import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { mapProfileRow, type ProfileRow } from "@/lib/data/profiles";
import type { UserProfile } from "@/types";

interface ProvisionBody {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  password?: string;
}

/**
 * Admin-exclusive faculty provisioning. Instructors cannot self-register, so
 * only a verified administrator may create their account. Uses the service-role
 * key on the server after confirming the caller's admin role.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured for this deployment." },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: caller } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .maybeSingle();
  const roles = (caller as { roles?: string[] } | null)?.roles ?? [];
  if (!roles.includes("admin")) {
    return NextResponse.json(
      { error: "Only administrators may provision faculty accounts." },
      { status: 403 }
    );
  }

  let body: ProvisionBody;
  try {
    body = (await request.json()) as ProvisionBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const department = body.department?.trim() ?? "";
  const password = body.password ?? "";

  if (!firstName || !lastName || !email || !department || !password) {
    return NextResponse.json(
      { error: "Name, email, department and a temporary password are required." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Server provisioning key is not configured." },
      { status: 503 }
    );
  }

  let targetUserId: string | null = null;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "instructor",
      first_name: firstName,
      middle_name: body.middleName?.trim() ?? "",
      last_name: lastName,
      department,
      must_reset_password: true,
    },
  });

  if (data?.user?.id) {
    targetUserId = data.user.id;
  } else if (error && (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered") || error.message.toLowerCase().includes("exists"))) {
    // If the account was already created (e.g. earlier failed role assignment),
    // locate the profile/auth user and re-assign temporary credentials and instructor role.
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile?.id) {
      targetUserId = existingProfile.id;
      await admin.auth.admin.updateUserById(existingProfile.id, {
        password,
        email_confirm: true,
        user_metadata: {
          role: "instructor",
          first_name: firstName,
          middle_name: body.middleName?.trim() ?? "",
          last_name: lastName,
          department,
          must_reset_password: true,
        },
      });
    } else {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { error: error?.message ?? "Unable to provision the account." },
      { status: 400 }
    );
  }

  if (!targetUserId) {
    return NextResponse.json(
      { error: "Could not resolve user identifier for provisioning." },
      { status: 500 }
    );
  }

  // Explicitly persist the instructor role and must_reset_password flag to public.profiles.
  // This guarantees the account is strictly 'instructor' regardless of database trigger defaults.
  await admin
    .from("profiles")
    .upsert(
      {
        id: targetUserId,
        email,
        first_name: firstName,
        middle_name: body.middleName?.trim() || null,
        last_name: lastName,
        roles: ["instructor"],
        active_view: "instructor",
        department,
        must_reset_password: true,
        is_suspended: false,
      },
      { onConflict: "id" }
    );

  // Read back the canonical record so the directory reflects the exact updated record.
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", targetUserId)
    .maybeSingle();

  const result: UserProfile = profile
    ? mapProfileRow(profile as ProfileRow)
    : {
        id: targetUserId,
        email,
        firstName,
        middleName: body.middleName?.trim() || undefined,
        lastName,
        roles: ["instructor"],
        activeView: "instructor",
        department,
        isSuspended: false,
        mustResetPassword: true,
        createdAt: new Date().toISOString(),
      };

  return NextResponse.json({ user: result });
}
