create extension if not exists pgcrypto;

create type public.app_role as enum ('employee','manager','director');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  manager_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending','completed')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path=public as $fn$
begin new.updated_at = now(); return new; end;
$fn$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger trg_todos_updated before update on public.todos for each row execute function public.update_updated_at_column();
create trigger trg_submissions_updated before update on public.submissions for each row execute function public.update_updated_at_column();

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path=public as $fn$
  select exists (select 1 from public.user_roles where user_id=_user_id and role=_role);
$fn$;

create or replace function public.subtree_user_ids(_root uuid)
returns setof uuid language sql stable security definer set search_path=public as $fn$
  with recursive tree as (
    select id from public.profiles where id = _root
    union all
    select p.id from public.profiles p join tree t on p.manager_id = t.id
  )
  select id from tree;
$fn$;

create or replace function public.can_view_user(_viewer uuid, _target uuid)
returns boolean language sql stable security definer set search_path=public as $fn$
  select _target in (select public.subtree_user_ids(_viewer));
$fn$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $fn$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'employee') on conflict do nothing;
  return new;
end;
$fn$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.todos enable row level security;
alter table public.submissions enable row level security;

create policy "view profiles in subtree" on public.profiles for select to authenticated
  using (public.can_view_user(auth.uid(), id));
create policy "update own profile" on public.profiles for update to authenticated
  using (auth.uid() = id);

create policy "view roles in subtree" on public.user_roles for select to authenticated
  using (public.can_view_user(auth.uid(), user_id));

create policy "view todos in subtree" on public.todos for select to authenticated
  using (public.can_view_user(auth.uid(), user_id));
create policy "insert own todos" on public.todos for insert to authenticated
  with check (auth.uid() = user_id);
create policy "update own todos" on public.todos for update to authenticated
  using (auth.uid() = user_id);
create policy "delete own todos" on public.todos for delete to authenticated
  using (auth.uid() = user_id);

create policy "view submissions in subtree" on public.submissions for select to authenticated
  using (public.can_view_user(auth.uid(), user_id));
create policy "insert own submissions" on public.submissions for insert to authenticated
  with check (auth.uid() = user_id);
create policy "update own submissions" on public.submissions for update to authenticated
  using (auth.uid() = user_id);
create policy "delete own submissions" on public.submissions for delete to authenticated
  using (auth.uid() = user_id);
