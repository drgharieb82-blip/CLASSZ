import { type ReactNode, useState } from "react";
import { Menu, PanelRightOpen, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle, LangSwitcher } from "@/components/brand/Toggles";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";

interface LessonPlayerLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
  panel: ReactNode;
}

export function LessonPlayerLayout({ sidebar, content, panel }: LessonPlayerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b glass px-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <Logo to="/student" className="hidden sm:flex" />
        <div className="ms-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setPanelOpen(true)}
          >
            <PanelRightOpen className="h-5 w-5" />
          </Button>
          <LangSwitcher />
          <ThemeToggle />
          <UserMenu role="student" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[260px] shrink-0 border-e bg-sidebar lg:block">
          {sidebar}
        </aside>

        <AnimatePresence>
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="absolute inset-y-0 start-0 w-[280px] border-e bg-sidebar shadow-2xl"
              >
                <Button variant="ghost" size="icon" className="absolute end-2 top-2 z-10" onClick={() => setSidebarOpen(false)}>
                  <X />
                </Button>
                {sidebar}
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 overflow-y-auto">
          {content}
        </main>

        <aside className="hidden w-[280px] shrink-0 border-s bg-sidebar xl:block">
          {panel}
        </aside>

        <AnimatePresence>
          {panelOpen && (
            <div className="fixed inset-0 z-50 xl:hidden">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
                onClick={() => setPanelOpen(false)}
              />
              <motion.aside
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="absolute inset-y-0 end-0 w-[300px] border-s bg-sidebar shadow-2xl"
              >
                <Button variant="ghost" size="icon" className="absolute end-2 top-2 z-10" onClick={() => setPanelOpen(false)}>
                  <X />
                </Button>
                {panel}
              </motion.aside>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
