-- ==============================================================================
-- AcademiaTrack: Create or Promote System Administrator Account
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/mmqmcqfvwxbsptmmcvbz
-- 2. Navigate to SQL Editor (left sidebar).
-- 3. Paste this script into a new query window.
-- 4. Adjust the email and password below if desired.
-- 5. Click "Run" (Ctrl+Enter).
-- ==============================================================================

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  -- >>> CONFIGURE YOUR ADMIN CREDENTIALS HERE <<<
  v_admin_email    text := 'admin@universityofbohol.edu.ph';
  v_admin_password text := 'AcademiaAdmin2026!';
  v_first_name     text := 'System';
  v_last_name      text := 'Administrator';

  v_user_id        uuid;
begin
  -- 1. Check if the user already exists in auth.users
  select id into v_user_id from auth.users where lower(email) = lower(v_admin_email);

  if v_user_id is not null then
    -- User exists: update password, auto-confirm email, and set metadata
    update auth.users
    set encrypted_password = extensions.crypt(v_admin_password, extensions.gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object(
          'role', 'admin',
          'first_name', v_first_name,
          'last_name', v_last_name
        ),
        raw_app_meta_data = jsonb_build_object(
          'provider', 'email',
          'providers', array['email']
        )
    where id = v_user_id;
  else
    -- User does not exist: create brand new user in auth.users
    v_user_id := gen_random_uuid();
    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      lower(v_admin_email),
      extensions.crypt(v_admin_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'admin', 'first_name', v_first_name, 'last_name', v_last_name),
      'authenticated',
      'authenticated'
    );
  end if;

  -- 2. Create or promote matching profile in public.profiles with admin role
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    roles,
    active_view,
    department,
    is_suspended
  ) values (
    v_user_id,
    lower(v_admin_email),
    v_first_name,
    v_last_name,
    array['admin'::public.user_role],
    'admin'::public.user_role,
    'General Administration',
    false
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    roles = array['admin'::public.user_role],
    active_view = 'admin'::public.user_role,
    department = coalesce(public.profiles.department, 'General Administration'),
    is_suspended = false;

  raise notice 'Admin account successfully configured for: % (ID: %)', v_admin_email, v_user_id;
end $$;
