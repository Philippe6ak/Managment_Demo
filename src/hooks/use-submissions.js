import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export function useSubmissions(userIdFilter) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["submissions", userIdFilter ?? "all", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      let q = supabase.from("submissions").select("*").order("created_at", { ascending: false });
      if (userIdFilter) q = q.eq("user_id", userIdFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: async (input) => {
      const { data, error } = await supabase
        .from("submissions")
        .insert({ ...input, user_id: session.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["submissions"] }),
  });
}

export function useDeleteSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("submissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["submissions"] }),
  });
}
