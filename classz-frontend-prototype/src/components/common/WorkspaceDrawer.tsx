import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkspaceAction, WorkspaceDrawerTab, WorkspaceRow } from "./workspace-contracts";

interface WorkspaceDrawerProps<Row extends WorkspaceRow> {
  row: Row | null;
  open: boolean;
  activeTab: string | null;
  onOpenChange: (open: boolean) => void;
  onTabChange: (tabId: string) => void;
  tabs: WorkspaceDrawerTab<Row>[];
  loadedTabs: Record<string, boolean>;
  title: string;
  description?: string;
  actions?: WorkspaceAction<Row>[];
  onAction?: (action: WorkspaceAction<Row>, row: Row) => void;
}

export function WorkspaceDrawer<Row extends WorkspaceRow>({
  row,
  open,
  activeTab,
  onOpenChange,
  onTabChange,
  tabs,
  loadedTabs,
  title,
  description,
  actions = [],
  onAction,
}: WorkspaceDrawerProps<Row>) {
  useEffect(() => {
    if (!open || tabs.length === 0 || activeTab) return;
    onTabChange(tabs[0].id);
  }, [activeTab, onTabChange, open, tabs]);

  if (!row) return null;

  const currentTab = activeTab || tabs[0]?.id;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="left-auto right-0 top-0 bottom-0 mt-0 h-screen w-full max-w-4xl rounded-none border-l border-border sm:max-w-4xl">
        <div className="flex h-full flex-col">
          <DrawerHeader className="border-b px-6 py-4 text-left">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <DrawerTitle>{title}</DrawerTitle>
                {description ? <DrawerDescription>{description}</DrawerDescription> : null}
              </div>
              {actions.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {actions.map((action) => (
                    <Button
                      key={action.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => onAction?.(action, row)}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <Tabs value={currentTab} onValueChange={onTabChange} className="space-y-4">
              <TabsList className="h-auto flex-wrap justify-start gap-1 rounded-xl bg-muted/60 p-1">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  {tab.lazy && !loadedTabs[tab.id]
                    ? <div className="py-10 text-sm text-muted-foreground">Loading {tab.label.toLowerCase()}…</div>
                    : tab.render(row)}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <DrawerFooter className="border-t px-6 py-4 sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button type="button" variant="outline" className="rounded-xl">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
