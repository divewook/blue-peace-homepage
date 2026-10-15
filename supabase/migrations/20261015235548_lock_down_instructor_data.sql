update public.instructors
set password_hash = extensions.crypt(password, extensions.gen_salt('bf', 12))
where password_hash is null and password is not null;

alter table public.instructors
  alter column password_hash set not null;

alter table public.instructors
  drop column if exists password;

drop policy if exists "Allow public insert" on public.instructors;
drop policy if exists "Allow public select" on public.instructors;
drop policy if exists "Allow public update" on public.instructors;

revoke all on public.instructors from anon, authenticated;
