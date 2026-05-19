import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import ErrorFallback from "@/components/ErrorFallback";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  User2,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Network,
  Moon,
  Sun,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppLayout() {
  const { profile, role, signOut } = useAuth();
  const location = useLocation();
  const canSeeTeam = role === "manager" || role === "director";

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/personal-space", label: "Personal Space", icon: User2 },
    ...(canSeeTeam ? [{ to: "/team", label: "Team", icon: Users }] : []),
    { to: "/settings", label: "Settings", icon: SettingsIcon },
    { to: "/account", label: "Account", icon: UserCog },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Network className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold">Hierarchy</span>
                <span className="text-xs text-muted-foreground capitalize">{role ?? "user"}</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((it) => (
                    <SidebarMenuItem key={it.to}>
                      <SidebarMenuButton asChild isActive={location.pathname === it.to} tooltip={it.label}>
                        <NavLink to={it.to}>
                          <it.icon />
                          <span>{it.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="rounded-md border border-sidebar-border bg-sidebar-accent/40 p-2 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium">{profile?.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={signOut} tooltip="Sign out">
                  <LogOut />
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground">{location.pathname}</span>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary
                  resetKeys={[location.pathname]}
                  onReset={reset}
                  FallbackComponent={ErrorFallback}
                >
                  <Outlet />
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
