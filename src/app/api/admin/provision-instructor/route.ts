import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { PROFILE_COLUMNS, mapProfileRow, type ProfileRow } from "@/lib/data/profiles";

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
    },
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to provision the account." },
      { status: 400 }
    );
  }

  // The profile row is created by the handle_new_user trigger; read it back so
  // the directory shows the canonical record.
  const { data: profile } = await admin
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", data.user.id)
    .maybeSingle();

  const result = profile
    ? mapProfileRow(profile as ProfileRow)
    : {
        id: data.user.id,
        email,
        firstName,
        middleName: body.middleName?.trim() || undefined,
        lastName,
        roles: ["instructor"] as const,
        activeView: "instructor" as const,
        department,
        isSuspended: false,
        createdAt: new Date().toISOString(),
      };

  return NextResponse.json({ user: result });
}
