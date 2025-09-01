import { FlashList } from "@shopify/flash-list";
import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import CardItem from "~/components/service-cards/card-item";
import { api } from "~/convex/_generated/api";
import { LegendList } from "@legendapp/list";
import * as AC from "@bacons/apple-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Search = () => {
  // use search params
  const { q } = useLocalSearchParams();

  const services = useQuery(api.consultantServices.searchServices, {
    query: q as string,
  });

  const { top, bottom } = useSafeAreaInsets();

  if (!services || services.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-neutral-900">
        <Text className="text-foreground">No results found for {q}</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: AC.systemGroupedBackground }}
    >
      <LegendList
        data={services}
        keyExtractor={(_, index) => index.toString()}
        // Custom cell renderer provides itemY position to each item
        renderItem={({ item, index }) => {
          return <CardItem service={item} />;
        }}
        showsVerticalScrollIndicator={false}
        // create gap
        contentContainerStyle={{
          paddingTop: top,
          paddingBottom: bottom,
          gap: 16,
        }} // Add padding at the bottom and gap between items
        // separate items

        estimatedItemSize={170} // ITEM_HEIGHT
        // Essential for iOS large title animation coordination
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
};

export default Search;
