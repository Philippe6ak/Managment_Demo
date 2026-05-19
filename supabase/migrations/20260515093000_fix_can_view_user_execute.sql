-- RLS policies call public.can_view_user(auth.uid(), ...).
-- Authenticated users must have EXECUTE on this policy helper. 
grant execute on function public.can_view_user(uuid, uuid) to authenticated;
-- grant execute on function public.has_role(uuid, public.app_role) to authenticated;
-- grant execute on function public.subtree_user_ids(uuid) to authenticated;