import { Filter } from "~/store/filters";
import { formatFilterForAPI } from "~/utils/filter-helpers";

// Convert client-side filters to database query format
export function convertFiltersToQueryArgs(
  filters: Filter[]
): Record<string, any> {
  const queryArgs: Record<string, any> = {};

  // Only process active filters
  const activeFilters = filters.filter((f) => f.isActive);

  for (const filter of activeFilters) {
    const apiFormat = formatFilterForAPI(filter);
    if (apiFormat) {
      Object.assign(queryArgs, apiFormat);
    }
  }

  return queryArgs;
}

// Map client filter keys to database field names if they differ
export const FILTER_KEY_MAPPING: Record<string, string> = {
  // Most filters map directly, but we can add special cases here
  meetingDuration: "duration",
  category: "categoryId", // This will need special handling since it's a lookup
};

// Helper to map filter key to database field
export function mapFilterKeyToDbField(filterKey: string): string {
  return FILTER_KEY_MAPPING[filterKey] || filterKey;
}

// Validate that a filter value is suitable for database querying
export function isValidFilterValue(value: any): boolean {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  if (Array.isArray(value) && value.length === 0) {
    return false;
  }

  if (typeof value === "number" && (isNaN(value) || !isFinite(value))) {
    return false;
  }

  return true;
}
