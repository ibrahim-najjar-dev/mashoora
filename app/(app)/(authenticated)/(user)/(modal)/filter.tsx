import { Text, View } from "react-native";
import { Filter as FilterComponent, FilterBar } from "~/components/filter";

const Filter = () => {
  return (
    <View className="flex-1">
      <FilterComponent />
      <FilterBar />
    </View>
  );
};

export default Filter;
