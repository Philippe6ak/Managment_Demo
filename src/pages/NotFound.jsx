import { Link, useLocation } from "react-router-dom";
import { Compass, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Compass className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-semibold tracking-tight">404</h1>
        <p className="text-muted-foreground">
          We couldn't find <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{location.pathname}</code>.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link to="/"><Home className="mr-2 h-4 w-4" />Back to home</Link>
        </Button>
        <Button asChild variant="outline" onClick={(e) => { e.preventDefault(); window.history.back(); }}>
          <a href="#"><ArrowLeft className="mr-2 h-4 w-4" />Go back</a>
        </Button>
      </div>
    </div>
  );
}
