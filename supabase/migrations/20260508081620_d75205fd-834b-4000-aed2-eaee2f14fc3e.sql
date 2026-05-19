-- Restrict SECURITY DEFINER helpers to internal use only
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.subtree_user_ids(uuid) from public, anon, authenticated;
revoke execute on function public.can_view_user(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Seed demo users
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
select '00000000-0000-0000-0000-000000000000', v.uid::uuid, 'authenticated', 'authenticated', v.email, crypt('password123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', v.full_name),
  now(), now(), '', '', '', ''
from (values
  ('11111111-1111-1111-1111-111111111111','director.a1@demo.app','Director A1'),
  ('22222222-2222-2222-2222-222222222221','manager.a11@demo.app','Manager A11'),
  ('22222222-2222-2222-2222-222222222222','manager.a12@demo.app','Manager A12'),
  ('33333333-3333-3333-3333-333333333331','employee.a111@demo.app','Employee A111'),
  ('33333333-3333-3333-3333-333333333332','employee.a121@demo.app','Employee A121'),
  ('11111111-1111-1111-1111-111111111112','director.a2@demo.app','Director A2'),
  ('22222222-2222-2222-2222-222222222223','manager.a21@demo.app','Manager A21'),
  ('33333333-3333-3333-3333-333333333333','employee.a211@demo.app','Employee A211')
) as v(uid, email, full_name)
where not exists (select 1 from auth.users u where u.id = v.uid::uuid);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email', now(), now(), now()
from auth.users u
where u.email like '%@demo.app'
  and not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email');

insert into public.profiles (id, full_name, email, manager_id)
select v.uid::uuid, v.full_name, v.email, nullif(v.manager,'')::uuid
from (values
  ('11111111-1111-1111-1111-111111111111','Director A1','director.a1@demo.app',''),
  ('22222222-2222-2222-2222-222222222221','Manager A11','manager.a11@demo.app','11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222','Manager A12','manager.a12@demo.app','11111111-1111-1111-1111-111111111111'),
  ('33333333-3333-3333-3333-333333333331','Employee A111','employee.a111@demo.app','22222222-2222-2222-2222-222222222221'),
  ('33333333-3333-3333-3333-333333333332','Employee A121','employee.a121@demo.app','22222222-2222-2222-2222-222222222222'),
  ('11111111-1111-1111-1111-111111111112','Director A2','director.a2@demo.app',''),
  ('22222222-2222-2222-2222-222222222223','Manager A21','manager.a21@demo.app','11111111-1111-1111-1111-111111111112'),
  ('33333333-3333-3333-3333-333333333333','Employee A211','employee.a211@demo.app','22222222-2222-2222-2222-222222222223')
) as v(uid, full_name, email, manager)
on conflict (id) do update set full_name = excluded.full_name, email = excluded.email, manager_id = excluded.manager_id;

insert into public.user_roles (user_id, role)
select v.uid::uuid, v.role::public.app_role
from (values
  ('11111111-1111-1111-1111-111111111111','director'),
  ('22222222-2222-2222-2222-222222222221','manager'),
  ('22222222-2222-2222-2222-222222222222','manager'),
  ('33333333-3333-3333-3333-333333333331','employee'),
  ('33333333-3333-3333-3333-333333333332','employee'),
  ('11111111-1111-1111-1111-111111111112','director'),
  ('22222222-2222-2222-2222-222222222223','manager'),
  ('33333333-3333-3333-3333-333333333333','employee')
) as v(uid, role)
on conflict (user_id, role) do nothing;

-- Seed sample todos and submissions for demo realism
insert into public.todos (user_id, title, description, status, due_date)
select uid::uuid, title, description, status, due_date::date
from (values
  ('33333333-3333-3333-3333-333333333331','Finish Q1 report','Compile metrics and email to manager','pending', current_date + 3),
  ('33333333-3333-3333-3333-333333333331','Review PR #482','Backend service refactor','completed', current_date - 1),
  ('33333333-3333-3333-3333-333333333332','Update onboarding doc','Add new tooling section','pending', current_date + 7),
  ('22222222-2222-2222-2222-222222222221','1:1s with team','Schedule weekly syncs','pending', current_date + 1),
  ('11111111-1111-1111-1111-111111111111','Strategy review','Prep board deck','pending', current_date + 14)
) as v(uid, title, description, status, due_date)
on conflict do nothing;

insert into public.submissions (user_id, name, email, message)
select uid::uuid, name, email, message
from (values
  ('33333333-3333-3333-3333-333333333331','Employee A111','employee.a111@demo.app','Requesting standing desk'),
  ('33333333-3333-3333-3333-333333333332','Employee A121','employee.a121@demo.app','Conference budget approval please'),
  ('22222222-2222-2222-2222-222222222221','Manager A11','manager.a11@demo.app','New hire request for Q2')
) as v(uid, name, email, message)
on conflict do nothing;
