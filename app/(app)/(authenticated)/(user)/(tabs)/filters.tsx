import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { Filter, FilterBar } from "~/components/filter";
import { allFilters } from "~/constants/filter-config";

const Filters = () => {
  const [filters, setFilters] = useState(allFilters);
  const props = { ...{ filters, setFilters } };
  return (
    <>
      <Stack.Screen
        options={
          {
            // headerRight: () => <HeaderButton />,
            // headerStyle: { backgroundColor },
          }
        }
      />
      <View className="flex-1">
        <Filter {...props} />
        <FilterBar {...props} />
      </View>
    </>
  );
};

// export default Filters;
