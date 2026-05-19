import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTodos } from "@/hooks/use-todos";
import { useSubmissions } from "@/hooks/use-submissions";
import { useTeam } from "@/hooks/use-team";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ListTodo, Mail, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { profile, role } = useAuth();
  const todos = useTodos();
  const subs = useSubmissions();
  const team = useTeam();

  const counts = useMemo(() => {
    const tt = todos.data ?? [];
    return {
      todos: tt.length,
      pending: tt.filter((t) => t.status === "pending").length,
      completed: tt.filter((t) => t.status === "completed").length,
      submissions: subs.data?.length ?? 0,
      team: team.data?.length ?? 0,
    };
  }, [todos.data, subs.data, team.data]);

  const recent = useMemo(() => {
    const a = (todos.data ?? []).map((t) => ({ id: `t-${t.id}`, title: t.title, kind: "Todo", time: t.created_at, user_id: t.user_id }));
    const b = (subs.data ?? []).map((s) => ({ id: `s-${s.id}`, title: s.message.slice(0, 60), kind: "Submission", time: s.created_at, user_id: s.user_id }));
    return [...a, ...b].sort((x, y) => +new Date(y.time) - +new Date(x.time)).slice(0, 8);
  }, [todos.data, subs.data]);

  const nameOf = (uid) => team.data?.find((m) => m.id === uid)?.full_name ?? "Unknown";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {profile?.full_name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground">
          You're signed in as <Badge variant="secondary" className="ml-1 capitalize">{role}</Badge>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<ListTodo className="h-5 w-5" />} label="Todos" value={counts.todos} hint={`${counts.pending} pending`} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={counts.completed} hint="All-time" />
        <StatCard icon={<Mail className="h-5 w-5" />} label="Submissions" value={counts.submissions} hint="In your scope" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Visible people" value={counts.team} hint="You + reports" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest todos and submissions across your scope.</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing yet.</p>
            ) : (
              <ul className="space-y-3">
                {recent.map((r) => (
                  <li key={r.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      {r.kind === "Todo" ? <ListTodo className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.kind} • {nameOf(r.user_id)} • {formatDistanceToNow(new Date(r.time), { addSuffix: true })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your scope</CardTitle>
            <CardDescription>People whose data you can see based on the org tree.</CardDescription>
          </CardHeader>
          <CardContent>
            {team.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <ul className="space-y-2">
                {(team.data ?? []).map((m) => (
                  <li key={m.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{m.role}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, hint }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        </div>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
