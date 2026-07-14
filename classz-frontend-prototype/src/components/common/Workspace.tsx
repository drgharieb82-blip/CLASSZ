import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/filters/Pagination";
import { cn } from "@/lib/utils";
import type {
  WorkspaceAction,
  WorkspaceAdapter,
  WorkspaceColumn,
  WorkspaceFilterSchema,
  WorkspaceQuery,
  WorkspaceResponse,
  WorkspaceRow,
} from "./workspace-contracts";
import { WorkspaceDrawer } from "./WorkspaceDrawer";

interface WorkspaceProps<Row extends WorkspaceRow> {
  adapter: WorkspaceAdapter<Row>;
  initialQuery?: Partial<WorkspaceQuery>;
  title?: string;
  emptyState?: ReactNode;
  headerSlot?: ReactNode;
}

const DEFAULT_QUERY: WorkspaceQuery = {
  mode: "browse",
  search: "",
  filters: {},
  pagination: {
    mode: "page",
    page: 1,
    pageSize: 100,
    cursor: null,
  },
  selectedIds: [],
  visibleColumns: [],
  savedViewId: null,
};

export function Workspace<Row extends WorkspaceRow>({
  adapter,
  initialQuery,
  title,
  emptyState,
  headerSlot,
}: WorkspaceProps<Row>) {
  const [query, setQuery] = useState<WorkspaceQuery>({
    ...DEFAULT_QUERY,
    ...initialQuery,
    filters: initialQuery?.filters || {},
    pagination: {
      ...DEFAULT_QUERY.pagination,
      ...initialQuery?.pagination,
    },
  });
  const [response, setResponse] = useState<WorkspaceResponse<Row>>({
    rows: [],
    totalCount: 0,
    hasMore: false,
    aggregates: [],
    availableFilters: {},
    availableSorts: [],
    pageInfo: {
      page: 1,
      pageSize: DEFAULT_QUERY.pagination.pageSize,
      nextCursor: null,
      prevCursor: null,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [loadedTabs, setLoadedTabs] = useState<Record<string, boolean>>({});

  const modeContract = adapter.getDefaultModeContract(query.mode);
  const filters = adapter.getFilters().filter((filter) => !filter.visibleInModes || filter.visibleInModes.includes(query.mode));
  const sorts: Array<{ field: string; label: string; direction?: "asc" | "desc" }> =
    (response.availableSorts && response.availableSorts.length > 0)
      ? response.availableSorts
      : adapter.getSorts().map((sort) => ({ field: sort.field, label: sort.label }));
  const allColumns = adapter.getColumns().filter((column) => !column.visibleInModes || column.visibleInModes.includes(query.mode));

  const visibleColumns = useMemo(() => {
    if (query.visibleColumns && query.visibleColumns.length > 0) {
      const visible = new Set(query.visibleColumns);
      return allColumns.filter((column) => visible.has(column.id));
    }
    return allColumns.filter((column) => column.defaultVisible !== false);
  }, [allColumns, query.visibleColumns]);

  const rows = response.rows;
  const activeRow = useMemo(() => rows.find((row) => row.id === activeEntityId) || null, [activeEntityId, rows]);
  const drawerTabs = activeRow ? adapter.getDrawerTabs(activeRow) : [];
  const drawerActions = activeRow ? adapter.getDrawerActions?.(activeRow) || [] : [];

  const loadRows = useCallback(async () => {
    if (query.mode !== "browse") {
      setError("Only browse mode is implemented in the generic Workspace right now.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const next = await adapter.fetchRows(query);
      setResponse(next);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load workspace data.");
    } finally {
      setLoading(false);
    }
  }, [adapter, query]);

  useEffect(() => {
    void loadRows();
  }, [loadRows, reloadToken]);

  useEffect(() => {
    if (!activeRow) {
      setActiveTab(null);
      setLoadedTabs({});
      return;
    }

    const firstTabId = drawerTabs[0]?.id ?? null;
    setActiveTab((current) => current && drawerTabs.some((tab) => tab.id === current) ? current : firstTabId);
    if (firstTabId) {
      setLoadedTabs((current) => ({ ...current, [firstTabId]: true }));
    }
  }, [activeRow, drawerTabs]);

  const patchQuery = (patch: Partial<WorkspaceQuery>) => {
    setQuery((current) => ({
      ...current,
      ...patch,
      pagination: {
        ...current.pagination,
        ...patch.pagination,
      },
    }));
  };

  const handleFilterChange = (filter: WorkspaceFilterSchema, value: string) => {
    setQuery((current) => ({
      ...current,
      filters: {
        ...current.filters,
        [filter.id]: value,
      },
      pagination: {
        ...current.pagination,
        page: 1,
      },
    }));
  };

  const clearFilters = () => {
    setQuery((current) => ({
      ...current,
      filters: {},
      pagination: {
        ...current.pagination,
        page: 1,
      },
    }));
  };

  const handleAction = async (action: WorkspaceAction<Row>, row?: Row) => {
    if (action.confirmation) {
      const confirmed = window.confirm(`${action.confirmation.title}\n\n${action.confirmation.message}`);
      if (!confirmed) return;
    }

    await action.handler({
      mode: query.mode,
      row,
      rows: row ? [row] : undefined,
      selectedIds: query.selectedIds || [],
      query,
      activeEntityId,
    });

    if (action.refreshPolicy !== "none") {
      setReloadToken((current) => current + 1);
    }
  };

  const activeFilterCount = Object.values(query.filters).filter(Boolean).length;
  const currentPage = response.pageInfo?.page || query.pagination.page || 1;
  const pageSize = response.pageInfo?.pageSize || query.pagination.pageSize || 100;
  const totalCount = response.totalCount || 0;
  const pageTitle = title || adapter.entity;

  return (
    <div className="space-y-4">
      {headerSlot}

      <div className="flex flex-wrap items-center gap-3">
        {modeContract.toolbarBehavior.showSearch ? (
          <div className="relative min-w-[280px] flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query.search || ""}
              onChange={(event) => patchQuery({
                search: event.target.value,
                pagination: { ...query.pagination, page: 1 },
              })}
              placeholder={adapter.searchPlaceholder}
              className="rounded-xl ps-9"
            />
          </div>
        ) : null}

        {modeContract.toolbarBehavior.showFilters ? (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <label key={filter.id} className="relative">
                <select
                  value={String(query.filters[filter.id] || "")}
                  onChange={(event) => handleFilterChange(filter, event.target.value)}
                  className="h-9 appearance-none rounded-xl border border-input bg-background pe-8 ps-3 text-xs font-medium"
                >
                  <option value="">{filter.label}</option>
                  {(response.availableFilters?.[filter.id]?.options || filter.options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </label>
            ))}

            {activeFilterCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-xl text-xs text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="me-1 h-3.5 w-3.5" />
                Clear
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="ms-auto flex flex-wrap items-center gap-2">
          {sorts.length > 0 ? (
            <label className="relative">
              <select
                value={query.sort ? `${query.sort.field}:${query.sort.direction}` : ""}
                onChange={(event) => {
                  const [field, direction] = event.target.value.split(":");
                  patchQuery({
                    sort: field ? { field, direction: (direction as "asc" | "desc") || "asc" } : undefined,
                    pagination: { ...query.pagination, page: 1 },
                  });
                }}
                className="h-9 appearance-none rounded-xl border border-input bg-background pe-8 ps-3 text-xs font-medium"
              >
                <option value="">Sort</option>
                {sorts.map((sort) => (
                  <option key={`${sort.field}:${sort.direction || "asc"}`} value={`${sort.field}:${sort.direction || "asc"}`}>
                    {sort.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </label>
          ) : null}

          <label className="relative">
            <select
              value={String(pageSize)}
              onChange={(event) => patchQuery({
                pagination: {
                  ...query.pagination,
                  page: 1,
                  pageSize: Number(event.target.value),
                },
              })}
              className="h-9 appearance-none rounded-xl border border-input bg-background pe-8 ps-3 text-xs font-medium"
            >
              {[25, 50, 100, 200].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </label>
        </div>
      </div>

      {response.aggregates && response.aggregates.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {response.aggregates.map((aggregate) => (
            <Badge key={aggregate.id} variant="outline" className="rounded-full">
              {aggregate.label} {aggregate.value}
            </Badge>
          ))}
        </div>
      ) : null}

      {loading ? (
        <Card className="border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading {pageTitle.toLowerCase()}…
        </Card>
      ) : error ? (
        <Card className="border border-destructive/30 bg-card p-10 text-center text-sm text-destructive">
          {error}
        </Card>
      ) : rows.length === 0 ? (
        emptyState || (
          <Card className="border bg-card p-10 text-center text-sm text-muted-foreground">
            No records found.
          </Card>
        )
      ) : (
        <Card className="overflow-hidden border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">{pageTitle}</p>
              <Badge variant="outline" className="rounded-full">
                {totalCount.toLocaleString()} results
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">Page {currentPage}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {visibleColumns.map((column) => (
                    <th
                      key={column.id}
                      className={cn(
                        "px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                        column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left",
                      )}
                      style={column.width ? { width: column.width, minWidth: column.minWidth } : undefined}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="w-[160px] px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const rowActions = adapter.getRowActions?.(row) || [];
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b transition-colors hover:bg-accent/20",
                        activeEntityId === row.id && "bg-accent/30",
                        modeContract.rowClickBehavior === "open-drawer" && "cursor-pointer",
                      )}
                      onClick={() => {
                        if (modeContract.rowClickBehavior === "open-drawer") {
                          setActiveEntityId(row.id);
                        }
                      }}
                    >
                      {visibleColumns.map((column) => (
                        <td
                          key={column.id}
                          className={cn(
                            "px-4 py-3 align-top",
                            column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left",
                          )}
                        >
                          {renderColumnValue(row, column)}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {rowActions.map((action) => (
                            <Button
                              key={action.id}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg px-2 text-xs"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleAction(action, row);
                              }}
                            >
                              {action.icon}
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3">
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              total={totalCount}
              onPageChange={(page) => patchQuery({ pagination: { ...query.pagination, page } })}
            />
          </div>
        </Card>
      )}

      <WorkspaceDrawer
        row={activeRow}
        open={Boolean(activeRow) && modeContract.drawerBehavior.enabled}
        activeTab={activeTab}
        onOpenChange={(open) => {
          if (!open) {
            setActiveEntityId(null);
            setActiveTab(null);
            setLoadedTabs({});
          }
        }}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
          setLoadedTabs((current) => ({ ...current, [tabId]: true }));
        }}
        tabs={drawerTabs}
        loadedTabs={loadedTabs}
        title={String((activeRow as Record<string, unknown> | null)?.title || (activeRow as Record<string, unknown> | null)?.name || activeRow?.id || "")}
        description={activeRow ? String((activeRow as Record<string, unknown>).subtitle || "") : undefined}
        actions={drawerActions}
        onAction={(action, row) => void handleAction(action, row)}
      />
    </div>
  );
}

function renderColumnValue<Row extends WorkspaceRow>(row: Row, column: WorkspaceColumn<Row>) {
  if (column.render) return column.render(row);
  if (!column.accessor) return String((row as Record<string, unknown>)[column.id] ?? "");
  return String((row as Record<string, unknown>)[column.accessor as string] ?? "");
}
