import { useNavigate } from "@tanstack/react-router";
import { LogOut, User, Palette, Languages, Bell, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLE_LIST, type Role } from "@/lib/roles";
import { useAuthStore } from "@/lib/stores/auth-store";

export function UserMenu({ role }: { role: Role }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const displayName = user?.full_name ?? "Guest";
  const displayEmail = user?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border bg-card p-1.5 pr-2.5 text-sm transition-colors hover:bg-accent">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="gradient-brand text-xs font-bold text-white">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden font-medium sm:inline">{displayName}</span>
        <ChevronsUpDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-xl">
        <DropdownMenuLabel>
          <p className="font-semibold">{displayName}</p>
          {displayEmail && <p className="text-xs font-normal text-muted-foreground">{displayEmail}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Switch dashboard</DropdownMenuLabel>
        <DropdownMenuGroup className="max-h-52 overflow-y-auto">
          {ROLE_LIST.map((r) => (
            <DropdownMenuItem key={r.key} onClick={() => navigate({ to: r.home })} className="gap-2">
              <r.icon className="h-4 w-4" /> {r.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><a href="/settings/account" className="gap-2"><User className="h-4 w-4" /> Account</a></DropdownMenuItem>
        <DropdownMenuItem asChild><a href="/settings/theme" className="gap-2"><Palette className="h-4 w-4" /> Theme</a></DropdownMenuItem>
        <DropdownMenuItem asChild><a href="/settings/language" className="gap-2"><Languages className="h-4 w-4" /> Language</a></DropdownMenuItem>
        <DropdownMenuItem asChild><a href="/settings/notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</a></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
