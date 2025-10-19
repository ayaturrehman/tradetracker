export type AppNavItem = {
  title: string;
  href: string;
  description?: string;
  roles?: Array<"USER" | "ADMIN" | "SUPER_ADMIN">;
};

export const dashboardNav: AppNavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    description: "Latest performance metrics and active account status.",
  },
  {
    title: "Accounts",
    href: "/accounts",
    description: "Connect new broker accounts and manage sync settings.",
  },
  {
    title: "Analytics",
    href: "/analytics",
    description: "Equity curves, performance breakdowns, and trade filters.",
  },
  {
    title: "Journal",
    href: "/journal",
    description: "Manual trade entries, notes, and media attachments.",
  },
  {
    title: "Billing",
    href: "/billing",
    description: "Plan details, invoices, and subscription management.",
  },
  {
    title: "Admin",
    href: "/admin",
    description: "User management, plan configuration, and sync diagnostics.",
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Super Admin",
    href: "/admin/super",
    description: "Global controls, system status, and credential management.",
    roles: ["SUPER_ADMIN"],
  },
];
