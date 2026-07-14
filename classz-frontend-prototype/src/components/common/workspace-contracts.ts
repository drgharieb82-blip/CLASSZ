import type { ReactNode } from "react";

export type WorkspaceMode = "browse" | "selection" | "link";
export type SortDirection = "asc" | "desc";
export type PaginationMode = "page" | "cursor";
export type WorkspaceRefreshPolicy = "none" | "row" | "query" | "drawer" | "full";

export interface WorkspaceQuery {
  mode: WorkspaceMode;
  search?: string;
  filters: Record<string, unknown>;
  sort?: {
    field: string;
    direction: SortDirection;
  };
  pagination: {
    mode: PaginationMode;
    page?: number;
    pageSize?: number;
    cursor?: string | null;
  };
  selectedIds?: string[];
  visibleColumns?: string[];
  savedViewId?: string | null;
}

export interface WorkspaceRow {
  id: string;
  [key: string]: unknown;
}

export interface WorkspaceAggregate {
  id: string;
  label: string;
  value: number | string;
}

export interface WorkspaceAvailableFilterOption {
  value: string;
  label: string;
  count?: number;
}

export type WorkspaceAvailableFilters = Record<string, {
  options?: WorkspaceAvailableFilterOption[];
  totalOptions?: number;
  async?: boolean;
}>;

export interface WorkspaceAvailableSort {
  field: string;
  label: string;
  direction?: SortDirection;
}

export interface WorkspaceResponse<Row extends WorkspaceRow = WorkspaceRow> {
  rows: Row[];
  totalCount?: number;
  hasMore: boolean;
  aggregates?: WorkspaceAggregate[];
  availableFilters?: WorkspaceAvailableFilters;
  availableSorts?: WorkspaceAvailableSort[];
  pageInfo?: {
    page?: number;
    pageSize?: number;
    nextCursor?: string | null;
    prevCursor?: string | null;
  };
}

export type WorkspaceFilterType =
  | "text"
  | "select"
  | "multi-select"
  | "async-select"
  | "date"
  | "date-range"
  | "number-range"
  | "boolean"
  | "tag";

export interface WorkspaceFilterSchema {
  id: string;
  label: string;
  type: WorkspaceFilterType;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  options?: {
    value: string;
    label: string;
  }[];
  asyncOptions?: {
    endpoint: string;
    valueField: string;
    labelField: string;
    searchParam?: string;
  };
  multiple?: boolean;
  clearable?: boolean;
  visibleInModes?: WorkspaceMode[];
  operators?: string[];
}

export type WorkspaceColumnAlign = "left" | "center" | "right";

export interface WorkspaceColumn<Row extends WorkspaceRow = WorkspaceRow> {
  id: string;
  label: string;
  sortable?: boolean;
  hideable?: boolean;
  defaultVisible?: boolean;
  width?: number | string;
  minWidth?: number | string;
  align?: WorkspaceColumnAlign;
  accessor?: keyof Row | string;
  render?: (row: Row) => ReactNode;
  exportValue?: (row: Row) => string | number | null;
  visibleInModes?: WorkspaceMode[];
}

export interface WorkspaceSelectionState {
  mode: "none" | "explicit" | "all-results";
  selectedIds: string[];
  excludedIds: string[];
  selectionCount: number;
}

export interface WorkspaceDrawerState {
  activeEntityId: string | null;
  activeTab: string | null;
  open: boolean;
  tabStatus: Record<string, {
    loaded: boolean;
    loading: boolean;
    error?: string | null;
    refreshedAt?: string | null;
  }>;
}

export interface WorkspaceActionContext<Row extends WorkspaceRow = WorkspaceRow> {
  mode: WorkspaceMode;
  row?: Row;
  rows?: Row[];
  selectedIds: string[];
  selectionState?: WorkspaceSelectionState;
  query: WorkspaceQuery;
  activeEntityId?: string | null;
}

export interface WorkspaceAction<Row extends WorkspaceRow = WorkspaceRow> {
  id: string;
  label: string;
  icon?: ReactNode;
  permission?: string | null;
  visibility?: {
    modes?: WorkspaceMode[];
    requiresSelection?: boolean;
    minSelectionCount?: number;
    maxSelectionCount?: number;
  };
  confirmation?: {
    title: string;
    message: string;
    confirmLabel?: string;
    destructive?: boolean;
  } | null;
  handler: (context: WorkspaceActionContext<Row>) => Promise<void> | void;
  refreshPolicy: WorkspaceRefreshPolicy;
}

export interface WorkspaceDrawerTab<Row extends WorkspaceRow = WorkspaceRow> {
  id: string;
  label: string;
  lazy?: boolean;
  render: (row: Row) => ReactNode;
}

export interface WorkspaceShortcut {
  key: string;
  description: string;
  actionId: string;
}

export interface WorkspaceModeContract {
  mode: WorkspaceMode;
  toolbarBehavior: {
    showSearch: boolean;
    showFilters: boolean;
    showSavedViews: boolean;
    showColumnManager: boolean;
    showExport: boolean;
    showBulkToolbar: boolean;
    primaryCta?: string;
  };
  rowClickBehavior: "open-drawer" | "toggle-select" | "navigate" | "none";
  doubleClickBehavior: "open-drawer" | "confirm" | "navigate" | "none";
  ctaBehavior: {
    id: string;
    label: string;
    requiresSelection?: boolean;
  } | null;
  keyboardShortcuts: WorkspaceShortcut[];
  drawerBehavior: {
    enabled: boolean;
    openOnRowClick: boolean;
    preserveTabOnRowChange: boolean;
  };
}

export interface WorkspaceSavedView {
  id: string;
  name: string;
  entity: string;
  query: Omit<WorkspaceQuery, "selectedIds">;
  isDefault?: boolean;
  isShared?: boolean;
}

export interface WorkspaceColumnState {
  order: string[];
  visible: string[];
  widths?: Record<string, number>;
}

export interface WorkspaceExportConfig {
  enabled: boolean;
  formats: ("csv" | "xlsx")[];
  scope: ("current-page" | "selected" | "all-results")[];
}

export interface WorkspacePermissionSet {
  workspace?: string[];
  row?: Record<string, string[]>;
}

export interface WorkspaceAdapter<Row extends WorkspaceRow = WorkspaceRow> {
  entity: string;
  searchPlaceholder: string;
  getColumns: () => WorkspaceColumn<Row>[];
  getFilters: () => WorkspaceFilterSchema[];
  getSorts: () => { field: string; label: string }[];
  getToolbarActions?: () => WorkspaceAction<Row>[];
  getBulkActions?: () => WorkspaceAction<Row>[];
  getRowActions?: (row: Row) => WorkspaceAction<Row>[];
  getDrawerActions?: (row: Row) => WorkspaceAction<Row>[];
  getDrawerTabs: (row: Row) => WorkspaceDrawerTab<Row>[];
  fetchRows: (query: WorkspaceQuery) => Promise<WorkspaceResponse<Row>>;
  fetchEntitySummary?: (id: string) => Promise<unknown>;
  fetchDrawerTab?: (id: string, tabId: string) => Promise<unknown>;
  getDefaultModeContract: (mode: WorkspaceMode) => WorkspaceModeContract;
}
