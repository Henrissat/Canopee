"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Leaf,
  LayoutDashboard,
  Sprout,
  MapPin,
  Plus,
  LogOut,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

export function AppShell({
  dueCount = 0,
  userEmail,
  userName,
  isLoggedIn = false,
  children,
}: {
  dueCount?: number;
  userEmail?: string | null;
  userName?: string | null;
  isLoggedIn?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const label = userName || userEmail || "";
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  const navItems: NavItem[] = [
    { href: "/", label: "Accueil", icon: LayoutDashboard },
    {
      href: "/plantes",
      label: "Plantes",
      icon: Sprout,
      badge: isLoggedIn && dueCount > 0 ? dueCount : undefined,
    },
    ...(isLoggedIn ? [{ href: "/emplacements", label: "Lieux", icon: MapPin }] : []),
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (isAuthPage) {
    return (
      <div className="min-h-full">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>
        <main className="mx-auto w-full max-w-md px-4 py-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold leading-none text-primary">
              Canopée
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Serre personnelle</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge != null && (
                  <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-sidebar-border p-3">
          <div className="flex items-center justify-between px-1">
            <ThemeToggle />
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sortir
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
              >
                <LogIn className="h-3.5 w-3.5" />
                Connexion
              </Link>
            )}
          </div>
          {isLoggedIn && label && (
            <p className="truncate px-2 text-xs text-muted-foreground" title={userEmail ?? undefined}>
              {label}
            </p>
          )}
          {isLoggedIn && (
            <Link
              href="/plantes/nouvelle"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </Link>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-md lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-display text-base font-semibold text-primary">Canopée</span>
          </Link>
          <ThemeToggle />
        </header>

        <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-lg items-end justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {item.badge != null && (
                    <span className="absolute right-1 top-0 h-2 w-2 rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}

            {isLoggedIn ? (
              <Link
                href="/plantes/nouvelle"
                className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                aria-label="Ajouter une plante"
              >
                <Plus className="h-6 w-6" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                aria-label="Connexion"
              >
                <LogIn className="h-5 w-5" />
              </Link>
            )}

            {navItems.slice(2).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
