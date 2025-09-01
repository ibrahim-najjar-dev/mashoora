import { atom } from "jotai";
import { z } from "zod";

// Base filter value schemas with discriminated unions
const numberFilterValueSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("single"),
    value: z.number(),
  }),
  z.object({
    type: z.literal("range"),
    min: z.number(),
    max: z.number(),
  }),
]);

const stringFilterValueSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("single"),
    value: z.string(),
  }),
  z.object({
    type: z.literal("multiple"),
    values: z.array(z.string()),
  }),
]);

const dateFilterValueSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("single"),
    value: z.string(), // Changed from z.date() to z.string() to match schema format "YYYY-MM-DD"
  }),
  z.object({
    type: z.literal("range"),
    startDate: z.string(), // Changed from z.date() to z.string()
    endDate: z.string(), // Changed from z.date() to z.string()
  }),
]);

const selectFilterValueSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("single"),
    value: z.union([z.string(), z.number()]),
  }),
  z.object({
    type: z.literal("multiple"),
    values: z.array(z.union([z.string(), z.number()])),
  }),
]);

// Individual filter schemas
const filterSchema = z.discriminatedUnion("filterType", [
  z.object({
    filterType: z.literal("number"),
    key: z.string(),
    value: numberFilterValueSchema,
    isActive: z.boolean().default(false),
  }),
  z.object({
    filterType: z.literal("string"),
    key: z.string(),
    value: stringFilterValueSchema,
    isActive: z.boolean().default(false),
  }),
  z.object({
    filterType: z.literal("date"),
    key: z.string(),
    value: dateFilterValueSchema,
    isActive: z.boolean().default(false),
  }),
  z.object({
    filterType: z.literal("select"),
    key: z.string(),
    value: selectFilterValueSchema,
    isActive: z.boolean().default(false),
  }),
]);

// Main filter state schema
export const filterStateSchema = z.object({
  filters: z.record(z.string(), filterSchema),
  activeFilterKeys: z.array(z.string()).default([]),
  lastUpdated: z.date().default(() => new Date()),
});

// Type inference
export type NumberFilterValue = z.infer<typeof numberFilterValueSchema>;
export type StringFilterValue = z.infer<typeof stringFilterValueSchema>;
export type DateFilterValue = z.infer<typeof dateFilterValueSchema>;
export type SelectFilterValue = z.infer<typeof selectFilterValueSchema>;
export type Filter = z.infer<typeof filterSchema>;

// More flexible filter map type for runtime
export type FilterMap = Record<string, Filter>;

// Custom FilterState type that's more flexible than Zod inferred type
export type FilterState = {
  filters: FilterMap;
  activeFilterKeys: string[];
  lastUpdated: Date;
};

// Initial state
const initialFilterState: FilterState = {
  filters: {},
  activeFilterKeys: [],
  lastUpdated: new Date(),
};

// Jotai atoms
export const filterStateAtom = atom<FilterState>(initialFilterState);

// Derived atoms for better performance
export const activeFiltersAtom = atom((get) => {
  const state = get(filterStateAtom);
  return state.activeFilterKeys
    .map((key) => state.filters[key])
    .filter(Boolean);
});

export const filterCountAtom = atom((get) => {
  const activeFilters = get(activeFiltersAtom);
  return activeFilters.length;
});

// Helper atoms for specific filter operations
export const addFilterAtom = atom(null, (get, set, filter: Filter) => {
  const currentState = get(filterStateAtom);
  set(filterStateAtom, {
    ...currentState,
    filters: {
      ...currentState.filters,
      [filter.key]: filter,
    } as FilterMap,
    activeFilterKeys: filter.isActive
      ? [...new Set([...currentState.activeFilterKeys, filter.key])]
      : currentState.activeFilterKeys,
    lastUpdated: new Date(),
  });
});

export const updateFilterAtom = atom(
  null,
  (get, set, key: string, updates: Partial<Filter>) => {
    const currentState = get(filterStateAtom);
    const existingFilter = currentState.filters[key];

    if (!existingFilter) return;

    const updatedFilter = { ...existingFilter, ...updates } as Filter;
    const newActiveKeys = updatedFilter.isActive
      ? [...new Set([...currentState.activeFilterKeys, key])]
      : currentState.activeFilterKeys.filter((k) => k !== key);

    set(filterStateAtom, {
      ...currentState,
      filters: {
        ...currentState.filters,
        [key]: updatedFilter,
      } as FilterMap,
      activeFilterKeys: newActiveKeys,
      lastUpdated: new Date(),
    });
  }
);

export const removeFilterAtom = atom(null, (get, set, key: string) => {
  const currentState = get(filterStateAtom);
  const { [key]: removed, ...remainingFilters } = currentState.filters;

  set(filterStateAtom, {
    ...currentState,
    filters: remainingFilters,
    activeFilterKeys: currentState.activeFilterKeys.filter((k) => k !== key),
    lastUpdated: new Date(),
  });
});

export const clearAllFiltersAtom = atom(null, (get, set) => {
  set(filterStateAtom, initialFilterState);
});

// Type guards for better type safety
export const isNumberFilter = (
  filter: Filter
): filter is Filter & { filterType: "number" } => {
  return filter.filterType === "number";
};

export const isStringFilter = (
  filter: Filter
): filter is Filter & { filterType: "string" } => {
  return filter.filterType === "string";
};

export const isDateFilter = (
  filter: Filter
): filter is Filter & { filterType: "date" } => {
  return filter.filterType === "date";
};

export const isSelectFilter = (
  filter: Filter
): filter is Filter & { filterType: "select" } => {
  return filter.filterType === "select";
};

// Helper functions for creating filters
export const createNumberFilter = (
  key: string,
  value: NumberFilterValue,
  isActive = false
): Filter => ({
  filterType: "number",
  key,
  value,
  isActive,
});

export const createStringFilter = (
  key: string,
  value: StringFilterValue,
  isActive = false
): Filter => ({
  filterType: "string",
  key,
  value,
  isActive,
});

export const createDateFilter = (
  key: string,
  value: DateFilterValue,
  isActive = false
): Filter => ({
  filterType: "date",
  key,
  value,
  isActive,
});

export const createSelectFilter = (
  key: string,
  value: SelectFilterValue,
  isActive = false
): Filter => ({
  filterType: "select",
  key,
  value,
  isActive,
});
