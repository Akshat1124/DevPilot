import { LayoutDashboard, MessageSquare, BookOpen, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const dashboardNavGroups: NavGroup[] = [
  {
    label: "General",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        title: "Repositories",
        href: "/dashboard/repos",
        icon: BookOpen,
      },
      {
        title: "Chats",
        href: "/dashboard/chats",
        icon: MessageSquare,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

/**
 * Returns true when the given pathname matches the nav item's href.
 * If `exact` is true, requires an exact match; otherwise checks prefix.
 */
export function isDashboardNavActive(
  pathname: string,
  href: string,
  exact = false
): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}
