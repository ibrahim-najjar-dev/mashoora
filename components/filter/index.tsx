import React, { useState } from "react";
import {
  PixelRatio,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { allFilterUIConfigs } from "~/constants/filter-config";
import { useFilters } from "~/hooks/use-filters";
import { cn } from "~/lib/utils";
import FilterOption from "../ui/filter-option";
import { Text } from "../ui/text";
import { View } from "../ui/view";

export const Filter = () => {
  const { filters, updateFilterValue } = useFilters();
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    setSelected((prev) => (prev === index ? null : index));
  };

  const handleFilterChange = (key: string, value: any) => {
    updateFilterValue(key, value, true);
  };

  // Get ordered filters for display
  const orderedFilters = allFilterUIConfigs
    .map((uiConfig) => ({
      filter: filters[uiConfig.key],
      uiConfig,
    }))
    .filter((item) => item.filter);

  return (
    <ScrollView
      style={{ flex: 1, width: "100%", maxWidth: 540, alignSelf: "center" }}
      contentContainerStyle={{
        gap: 12,
        padding: PixelRatio.getPixelSizeForLayoutSize(9),
        width: "100%",
      }}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {orderedFilters.map(({ filter, uiConfig }, i) => (
        <FilterOption
          key={filter.key}
          filter={filter}
          uiConfig={uiConfig}
          index={i}
          isSelected={selected === i}
          onSelect={handleSelect}
          onFilterChange={handleFilterChange}
        />
      ))}
    </ScrollView>
  );
};

export const FilterBar = () => {
  const { bottom } = useSafeAreaInsets();
  const { resetFilters, filterCount } = useFilters();

  const handleReset = () => {
    resetFilters();
  };

  const handleApply = () => {
    // Filters are automatically applied via the reactive system
    // We could add additional logic here like analytics tracking or navigation
    console.log("Applied filters with count:", filterCount);

    // You could emit an event or call a callback to close the filter modal
    // For example, if this is in a modal:
    // onFiltersApplied?.();
  };

  return (
    <View
      style={[
        {
          paddingHorizontal: PixelRatio.getPixelSizeForLayoutSize(9),
        },
        {
          paddingBottom: bottom + 10,
        },
      ]}
      className={cn("py-3 justify-between flex-row w-full max-w-[540px]", {})}
    >
      <TouchableOpacity activeOpacity={0.7} onPress={handleReset}>
        <Text>Reset all</Text>
      </TouchableOpacity>
      <View>
        <Pressable
          android_ripple={{
            color: "rgba(255, 255, 255, 0.1)",
          }}
          onPress={handleApply}
        >
          <Text style={{ color: "white" }}>Apply Filters ({filterCount})</Text>
        </Pressable>
      </View>
    </View>
  );
};
