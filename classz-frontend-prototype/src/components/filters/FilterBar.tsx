import { useState } from "react";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: FilterOption[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  totalResults?: number;
  placeholder?: string;
}

export function FilterBar({
  search,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  totalResults,
  placeholder = "Search...",
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const activeCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search + Filter toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="ps-9 rounded-xl"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className={cn("rounded-xl gap-1.5", showFilters && "border-primary text-primary")}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <Badge className="h-5 min-w-5 rounded-full bg-primary text-xs text-white border-0">{activeCount}</Badge>
          )}
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="rounded-xl text-xs text-muted-foreground" onClick={onClearFilters}>
            <X className="h-3.5 w-3.5 me-1" /> Clear
          </Button>
        )}
        {totalResults !== undefined && (
          <span className="text-xs text-muted-foreground ms-auto">{totalResults.toLocaleString()} results</span>
        )}
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 rounded-xl border bg-card/50 p-3">
          {filters.map((f) => (
            <div key={f.key} className="relative">
              <select
                value={activeFilters[f.key] || ""}
                onChange={(e) => onFilterChange(f.key, e.target.value)}
                className={cn(
                  "h-8 appearance-none rounded-lg border bg-card pe-8 ps-3 text-xs font-medium transition-colors",
                  activeFilters[f.key] ? "border-primary text-primary" : "text-muted-foreground",
                )}
              >
                <option value="">{f.label}</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}

      {/* Active filter badges */}
      {activeCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null;
            const filterDef = filters.find((f) => f.key === key);
            const optLabel = filterDef?.options.find((o) => o.value === value)?.label ?? value;
            return (
              <Badge key={key} variant="outline" className="rounded-full text-xs gap-1">
                {filterDef?.label}: {optLabel}
                <button onClick={() => onFilterChange(key, "")} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
