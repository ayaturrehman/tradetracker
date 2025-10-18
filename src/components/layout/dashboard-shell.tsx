"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNav } from "@/config/navigation";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  userRole?: string;
  userName?: string | null;
};

export function DashboardShell({
  children,
  userRole = "USER",
  userName,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background text-foreground lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-r border-foreground/10 bg-background lg:border-b-0">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="font-semibold">
            TradeTracker
          </Link>
          <div className="hidden text-sm text-foreground/60 lg:block">
            {userName ? `Hi, ${userName}` : "Member"}
          </div>
        </div>
        <nav className="space-y-1 px-2 pb-6 pt-2">
          {dashboardNav
            .filter((item) => {
              if (!item.roles) {
                return true;
              }
              return item.roles.includes(userRole as typeof item.roles[number]);
            })
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col rounded-xl border border-transparent px-3 py-3 text-sm transition",
                    isActive
                      ? "border-foreground/10 bg-foreground/5 font-semibold text-foreground"
                      : "text-foreground/70 hover:border-foreground/10 hover:bg-foreground/[0.03]",
                  )}
                >
                  <span>{item.title}</span>
                  {item.description && (
                    <span className="text-xs text-foreground/50">
                      {item.description}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>
      </aside>
      <main className="min-h-screen bg-background/95">
        <div className="mx-auto flex w-full max-w-none flex-col gap-8 px-2 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
