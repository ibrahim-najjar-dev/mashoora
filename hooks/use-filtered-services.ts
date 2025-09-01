import { usePaginatedQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "~/convex/_generated/api";
import { useFilters } from "~/hooks/use-filters";
import { convertFiltersToQueryArgs } from "~/utils/filter-to-query";

export const useFilteredServices = (
  searchQuery?: string,
  initialNumItems = 2
) => {
  const { activeFilters } = useFilters();

  // Convert active filters to query arguments
  const queryArgs = useMemo(() => {
    const filterArgs = convertFiltersToQueryArgs(activeFilters);

    // Add search query if provided
    if (searchQuery && searchQuery.trim() !== "") {
      filterArgs.searchQuery = searchQuery.trim();
    }

    return filterArgs;
  }, [activeFilters, searchQuery]);

  // Use the filtered services query
  const {
    results: services,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.filteredServices.getFilteredServicesPaginated,
    { filters: queryArgs },
    { initialNumItems }
  );

  const handleLoadMore = (numItems = 2) => {
    if (status === "CanLoadMore") {
      loadMore(numItems);
    }
  };

  return {
    services: services || [],
    isLoading: status === "LoadingFirstPage",
    isLoadingMore: status === "LoadingMore",
    canLoadMore: status === "CanLoadMore",
    loadMore: handleLoadMore,
    status,
    // Additional helper data
    hasActiveFilters: activeFilters.length > 0,
    activeFilterCount: activeFilters.length,
  };
};

// Hook for getting filter options from the database
export const useFilterOptions = () => {
  return {
    // This could be expanded to fetch dynamic filter options
    // For now, we use the static configuration from filter-config.ts
  };
};
