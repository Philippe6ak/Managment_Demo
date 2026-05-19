import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCreateTodo, useDeleteTodo, useTodos, useUpdateTodo } from "@/hooks/use-todos";
import { useCreateSubmission, useDeleteSubmission, useSubmissions } from "@/hooks/use-submissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function PersonalSpace() {
  const { user } = useAuth();
  const todos = useTodos(user?.id);
  const subs = useSubmissions(user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Personal space</h1>
        <p className="text-muted-foreground">Your private todos and form submissions.</p>
      </div>
      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos ({todos.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="submissions">Submissions ({subs.data?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="todos"><TodosPanel /></TabsContent>
        <TabsContent value="submissions"><SubmissionsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

function TodosPanel() {
  const { user } = useAuth();
  const { data = [] } = useTodos(user?.id);
  const create = useCreateTodo();
  const update = useUpdateTodo();
  const remove = useDeleteTodo();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [search, setSearch] = useState("");

  const filtered = data.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  const onAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await create.mutateAsync({ title, description: description || undefined, due_date: dueDate || null });
      setTitle(""); setDescription(""); setDueDate("");
      toast.success("Todo added");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Your todos</CardTitle>
            <CardDescription>Track what you need to get done.</CardDescription>
          </div>
          <div className="relative w-56">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No todos yet.</p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((t) => (
                <TodoRow
                  key={t.id}
                  todo={t}
                  onToggle={(s) => update.mutate({ id: t.id, status: s })}
                  onDelete={() => remove.mutate(t.id, { onSuccess: () => toast.success("Deleted") })}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>New todo</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onAdd} className="space-y-3">
            <div className="space-y-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} /></div>
            <div className="space-y-1.5"><Label>Due date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={create.isPending}><Plus className="mr-2 h-4 w-4" />Add todo</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function TodoRow({ todo, onToggle, onDelete }) {
  const done = todo.status === "completed";
  return (
    <li className="flex items-start gap-3 rounded-md border p-3">
      <Checkbox checked={done} onCheckedChange={(v) => onToggle(v ? "completed" : "pending")} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${done ? "text-muted-foreground line-through" : ""}`}>{todo.title}</p>
        {todo.description && <p className="text-xs text-muted-foreground">{todo.description}</p>}
        <div className="mt-1 flex items-center gap-2">
          <Badge variant={done ? "secondary" : "outline"} className="capitalize">{todo.status}</Badge>
          {todo.due_date && <span className="text-xs text-muted-foreground">Due {format(new Date(todo.due_date), "MMM d")}</span>}
        </div>
      </div>
      <ConfirmDelete onConfirm={onDelete} />
    </li>
  );
}

function SubmissionsPanel() {
  const { user, profile } = useAuth();
  const { data = [] } = useSubmissions(user?.id);
  const create = useCreateSubmission();
  const remove = useDeleteSubmission();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [message, setMessage] = useState("");

  const onAdd = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    try {
      await create.mutateAsync({ name, email, message });
      setMessage("");
      toast.success("Submission sent");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Your submissions</CardTitle>
          <CardDescription>Forms you've sent.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.map((s) => (
                <li key={s.id} className="flex items-start gap-3 rounded-md border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{s.name} <span className="font-normal text-muted-foreground">— {s.email}</span></p>
                    <p className="mt-0.5 text-sm">{s.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{format(new Date(s.created_at), "PPp")}</p>
                  </div>
                  <ConfirmDelete onConfirm={() => remove.mutate(s.id, { onSuccess: () => toast.success("Deleted") })} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>New submission</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onAdd} className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} /></div>
            <div className="space-y-1.5"><Label>Message</Label><Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={1000} /></div>
            <Button type="submit" className="w-full" disabled={create.isPending}><Plus className="mr-2 h-4 w-4" />Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ConfirmDelete({ onConfirm }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
