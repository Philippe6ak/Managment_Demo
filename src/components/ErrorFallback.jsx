import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function getFriendlyMessage(error) {
  const msg = error?.message ?? String(error ?? "Unknown error");
  if (/JWT|auth|unauthorized|401/i.test(msg)) {
    return "Your session expired or you're not authorized. Please sign in again.";
  }
  if (/network|fetch|failed to fetch|load failed/i.test(msg)) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  if (/permission|forbidden|403|row-level security|rls/i.test(msg)) {
    return "You don't have permission to view this content.";
  }
  return msg;
}

export default function ErrorFallback({ error, resetErrorBoundary, fullscreen = false }) {
  const wrap = fullscreen
    ? "flex min-h-screen items-center justify-center bg-background p-6"
    : "p-6";

  return (
    <div className={wrap}>
      <div className="mx-auto w-full max-w-lg space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{getFriendlyMessage(error)}</AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-2">
          <Button onClick={resetErrorBoundary}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
        </div>
        {import.meta.env.DEV && error?.stack && (
          <pre className="max-h-64 overflow-auto rounded-md border bg-muted p-3 text-xs text-muted-foreground">
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  );
}
