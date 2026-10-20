-- ============================================================================
-- Fix Faculty Provisioning & Add First-Time Password Reset Support
--
-- Run this script in the Supabase Dashboard SQL Editor to:
-- 1. Ensure `must_reset_password` column exists on `public.profiles`.
-- 2. Update `handle_new_user()` trigger function to preserve instructor roles.
-- 3. Automatically fix any instructor accounts previously provisioned as students.
-- ============================================================================

-- 1. Add must_reset_password column to public.profiles if not exists
alter table public.profiles
  add column if not exists must_reset_password boolean not null default false;

-- 2. Update handle_new_user() to properly assign requested roles and flag
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role       text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  v_email      text := lower(coalesce(new.email, ''));
  v_domain     text := 'universityofbohol.edu.ph';
  v_must_reset boolean := coalesce((new.raw_user_meta_data ->> 'must_reset_password')::boolean, false);
begin
  -- Students may only register with the official university email domain.
  if v_role = 'student' and v_email not like '%@' || v_domain then
    raise exception
      'Student registration is restricted to the official university email domain (@%).',
      v_domain using errcode = 'check_violation';
  end if;

  -- Validate role against enum values
  if v_role not in ('admin', 'instructor', 'student') then
    v_role := 'student';
  end if;

  insert into public.profiles (
    id, email, first_name, middle_name, last_name,
    roles, active_view, department, student_number, avatar_url, must_reset_password
  ) values (
    new.id,
    v_email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'middle_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    array[v_role::public.user_role],
    v_role::public.user_role,
    nullif(new.raw_user_meta_data ->> 'department', ''),
    nullif(new.raw_user_meta_data ->> 'student_number', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    v_must_reset
  )
  on conflict (id) do update set
    roles = excluded.roles,
    active_view = excluded.active_view,
    department = coalesce(excluded.department, public.profiles.department),
    first_name = case when excluded.first_name <> '' then excluded.first_name else public.profiles.first_name end,
    last_name = case when excluded.last_name <> '' then excluded.last_name else public.profiles.last_name end,
    must_reset_password = excluded.must_reset_password;

  return new;
end $$;

-- 3. Automatically fix any instructor accounts whose auth metadata specifies 'instructor'
--    but were saved as 'student' in public.profiles.
update public.profiles p
set
  roles = array['instructor'::public.user_role],
  active_view = 'instructor'::public.user_role,
  must_reset_password = true
from auth.users u
where p.id = u.id
  and u.raw_user_meta_data ->> 'role' = 'instructor'
  and not ('instructor' = any(p.roles));

-- 4. Enforce RLS restriction: suspended faculty cannot create classes or edit academic records
create or replace function public.is_class_instructor(p_class_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.classes c
    join public.profiles p on p.id = c.instructor_id
    where c.id = p_class_id 
      and c.instructor_id = auth.uid()
      and coalesce(p.is_suspended, false) = false
  );
$$;

drop policy if exists classes_insert on public.classes;
create policy classes_insert on public.classes
  for insert with check (
    instructor_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.is_suspended, false) = false
        and ('instructor' = any(p.roles) or 'admin' = any(p.roles))
    )
  );

drop policy if exists classes_update on public.classes;
create policy classes_update on public.classes
  for update using (
    instructor_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.is_suspended, false) = false
    )
  ) with check (
    instructor_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.is_suspended, false) = false
    )
  );

drop policy if exists classes_delete on public.classes;
create policy classes_delete on public.classes
  for delete using (
    instructor_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.is_suspended, false) = false
    )
  );

