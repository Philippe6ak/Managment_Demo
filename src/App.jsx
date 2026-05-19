import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth-context";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import ErrorFallback from "@/components/ErrorFallback";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PersonalSpace from "@/pages/PersonalSpace";
import Team from "@/pages/Team";
import Settings from "@/pages/Settings";
import Account from "@/pages/Account";
import NotFound from "@/pages/NotFound";

function RouteErrorBoundary({ children }) {
  const location = useLocation();
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          resetKeys={[location.pathname]}
          onReset={reset}
          FallbackComponent={(props) => <ErrorFallback {...props} />}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={(props) => <ErrorFallback {...props} fullscreen />}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <RouteErrorBoundary>
              <Routes>
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate replace to="dashboard" />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="personal-space" element={<PersonalSpace />} />
                  <Route path="team" element={<Team />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="account" element={<Account />} />
                </Route>
                <Route path="login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </RouteErrorBoundary>
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
