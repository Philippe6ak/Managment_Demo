import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useTeam } from "@/hooks/use-team";
import { useTodos } from "@/hooks/use-todos";
import { useSubmissions } from "@/hooks/use-submissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, ListTodo, Mail, X } from "lucide-react";
import { format } from "date-fns";

export default function Team() {
  const { role } = useAuth();
  const team = useTeam();
  const todos = useTodos();
  const subs = useSubmissions();
  const [selected, setSelected] = useState(null);

  if (role !== "manager" && role !== "director") return <Navigate to="/dashboard" replace />;

  const members = team.data ?? [];
  const byManager = useMemo(() => {
    const m = new Map();
    for (const p of members) {
      const k = p.manager_id;
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(p);
    }
    return m;
  }, [members]);

  const roots = members.filter((m) => !members.some((x) => x.id === m.manager_id));

  const counts = (uid) => ({
    todos: (todos.data ?? []).filter((t) => t.user_id === uid).length,
    subs: (subs.data ?? []).filter((s) => s.user_id === uid).length,
  });

  const selectedMember = selected ? members.find((m) => m.id === selected) ?? null : null;
  const selTodos = (todos.data ?? []).filter((t) => t.user_id === selected);
  const selSubs = (subs.data ?? []).filter((s) => s.user_id === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
        <p className="text-muted-foreground">Hierarchical view of everyone in your scope.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Org tree</CardTitle>
            <CardDescription>Click a person to see their data.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {roots.map((r) => (
                <TreeNode key={r.id} node={r} childrenMap={byManager} counts={counts} selected={selected} onSelect={setSelected} depth={0} />
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>{selectedMember ? selectedMember.full_name : "Select a team member"}</CardTitle>
              <CardDescription>{selectedMember?.email ?? "Their todos and submissions appear here."}</CardDescription>
            </div>
            {selected && (
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)}><X className="h-4 w-4" /></Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMember ? (
              <>
                <Badge variant="outline" className="capitalize">{selectedMember.role}</Badge>
                <Section title="Todos" icon={<ListTodo className="h-4 w-4" />} empty="No todos.">
                  {selTodos.map((t) => (
                    <li key={t.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{t.title}</p>
                        <Badge variant={t.status === "completed" ? "secondary" : "outline"} className="capitalize">{t.status}</Badge>
                      </div>
                      {t.description && <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>}
                      {t.due_date && <p className="mt-1 text-xs text-muted-foreground">Due {format(new Date(t.due_date), "PP")}</p>}
                    </li>
                  ))}
                </Section>
                <Section title="Submissions" icon={<Mail className="h-4 w-4" />} empty="No submissions.">
                  {selSubs.map((s) => (
                    <li key={s.id} className="rounded-md border p-3">
                      <p className="text-sm font-medium">{s.name} <span className="font-normal text-muted-foreground">— {s.email}</span></p>
                      <p className="mt-1 text-sm">{s.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{format(new Date(s.created_at), "PPp")}</p>
                    </li>
                  ))}
                </Section>
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Pick someone from the tree.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Section({ title, icon, children, empty }) {
  const arr = Array.isArray(children) ? children : [children];
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">{icon}{title}</p>
      {arr.length === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : <ul className="space-y-2">{children}</ul>}
    </div>
  );
}

function TreeNode({ node, childrenMap, counts, selected, onSelect, depth }) {
  const [open, setOpen] = useState(true);
  const children = childrenMap.get(node.id) ?? [];
  const c = counts(node.id);
  const active = selected === node.id;
  return (
    <li>
      <div
        className={`group flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 transition-colors hover:bg-accent ${active ? "bg-accent" : ""}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {children.length > 0 ? (
          <button onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} className="rounded p-0.5 hover:bg-background">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : <span className="w-5" />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{node.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">{node.email}</p>
        </div>
        <Badge variant="outline" className="capitalize">{node.role}</Badge>
        <span className="ml-2 text-xs text-muted-foreground">{c.todos}t · {c.subs}s</span>
      </div>
      {open && children.length > 0 && (
        <ul className="space-y-1">
          {children.map((ch) => (
            <TreeNode key={ch.id} node={ch} childrenMap={childrenMap} counts={counts} selected={selected} onSelect={onSelect} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
