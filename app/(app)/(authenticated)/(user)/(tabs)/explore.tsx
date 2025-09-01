import { AnimatedHeaderSystem } from "~/components/animated-header-system";
import { ServiceCardsContainer } from "~/components/service-cards/service-cards-container";
import { useHomeAnimation } from "~/lib/home-animation-provider";
import { useFilteredServices } from "~/hooks/use-filtered-services";

const Explore = () => {
  const { searchQuery, setSearchQuery } = useHomeAnimation();

  // Use the new filtered services hook that integrates client-side filters with database queries
  const {
    services,
    isLoading,
    isLoadingMore,
    canLoadMore,
    loadMore,
    hasActiveFilters,
    activeFilterCount,
  } = useFilteredServices(searchQuery, 2);

  const handleLoadMore = () => {
    loadMore(2); // Load 2 more items
  };

  console.log(
    "services",
    searchQuery,
    "hasActiveFilters:",
    hasActiveFilters,
    "activeFilterCount:",
    activeFilterCount
  );

  return (
    <AnimatedHeaderSystem tabName="explore">
      <ServiceCardsContainer
        data={services}
        isLoading={isLoading}
        canLoadMore={canLoadMore}
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
      />
    </AnimatedHeaderSystem>
  );
};

export default Explore;
