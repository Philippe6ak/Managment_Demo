import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export function useTeam() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["team", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const [{ data: profiles, error: pe }, { data: roles, error: re }] = await Promise.all([
        supabase.from("profiles").select("id,full_name,email,manager_id"),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      if (pe) throw pe;
      if (re) throw re;
      const order = { director: 0, manager: 1, employee: 2 };
      const byUser = new Map();
      for (const r of roles ?? []) {
        const cur = byUser.get(r.user_id);
        const next = r.role;
        if (!cur || (next && order[next] < order[cur])) byUser.set(r.user_id, next);
      }
      return (profiles ?? []).map((p) => ({ ...p, role: byUser.get(p.id) ?? null }));
    },
  });
}
