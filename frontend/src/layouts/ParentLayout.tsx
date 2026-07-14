import { LayoutDashboard, Settings } from "lucide-react";

import { Shell } from "../components/Shell";

const parentNavItems = [
  { labelKey: "nav.dashboard", href: "/parent/dashboard", icon: LayoutDashboard },
  { labelKey: "nav.settings", href: "/parent/settings", icon: Settings },
];

export function ParentLayout() {
  return (
    <Shell
      title="i18n:shell.parentTitle"
      roleLabel="i18n:roles.parentWorkspace"
      accent="linear-gradient(90deg, #253129, #18a999, #e8b44b)"
      navItems={parentNavItems}
    />
  );
}
