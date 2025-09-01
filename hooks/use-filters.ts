import { useAtom } from "jotai";
import { useEffect } from "react";
import { defaultFilters } from "~/constants/filter-config";
import {
  filterStateAtom,
  updateFilterAtom,
  clearAllFiltersAtom,
  activeFiltersAtom,
  addFilterAtom,
  removeFilterAtom,
  filterCountAtom,
} from "~/store/filters";

export const useFilters = () => {
  const [filterState] = useAtom(filterStateAtom);
  const [, updateFilter] = useAtom(updateFilterAtom);
  const [, addFilter] = useAtom(addFilterAtom);
  const [, removeFilter] = useAtom(removeFilterAtom);
  const [, clearAllFilters] = useAtom(clearAllFiltersAtom);
  const [activeFilters] = useAtom(activeFiltersAtom);
  const [filterCount] = useAtom(filterCountAtom);

  // Initialize default filters on first use
  useEffect(() => {
    const existingKeys = Object.keys(filterState.filters);

    defaultFilters.forEach((filter) => {
      if (!existingKeys.includes(filter.key)) {
        addFilter(filter);
      }
    });
  }, [addFilter, filterState.filters]);

  const updateFilterValue = (key: string, value: any, isActive = true) => {
    console.log(value);
    updateFilter(key, { value, isActive });
  };

  const toggleFilterActive = (key: string) => {
    const filter = filterState.filters[key];
    if (filter) {
      updateFilter(key, { isActive: !filter.isActive });
    }
  };

  const resetFilters = () => {
    clearAllFilters();
    // Re-initialize with defaults
    setTimeout(() => {
      defaultFilters.forEach((filter) => addFilter(filter));
    }, 0);
  };

  return {
    filters: filterState.filters,
    activeFilters,
    filterCount,
    updateFilterValue,
    toggleFilterActive,
    resetFilters,
    addFilter,
    removeFilter,
    clearAllFilters,
  };
};
