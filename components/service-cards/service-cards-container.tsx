import { FlashList } from "@shopify/flash-list";
import React, { useCallback } from "react";
import {
  FlatList,
  ActivityIndicator,
  View,
  Text,
  ListRenderItem,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CustomCellRendererComponent from "~/components/service-cards/service-card-cell-renderer";
import { UpcomingItem } from "~/components/service-cards/service-card-item";
import { SkeletonCard } from "~/components/service-cards/skeleton-card";
import { NAV_THEME } from "~/constants/Colors";
import { Doc } from "~/convex/_generated/dataModel";
import { useColorScheme } from "~/lib/useColorScheme";
import { EnhancedService } from "~/types/enhanced-services";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export const ServiceCardsContainer = ({
  data,
  isLoading,
  canLoadMore,
  onLoadMore,
  isLoadingMore,
}: {
  data: EnhancedService[];
  isLoading?: boolean;
  canLoadMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}) => {
  const insets = useSafeAreaInsets();

  const { colorScheme } = useColorScheme();

  // Shared scroll position value - drives all item animations
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  // Render item function - itemY will be provided by CustomCellRendererComponent
  const renderItem = useCallback(
    ({ item, index }: any) => {
      return <UpcomingItem item={item} index={index} scrollY={scrollY} />;
    },
    [scrollY]
  );

  // Load more when reaching the end of the list
  const handleEndReached = useCallback(() => {
    if (canLoadMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [canLoadMore, isLoadingMore, onLoadMore]);

  // Footer component for loading indicator
  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View>
        {Array.from({ length: 2 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </View>
    );
  }, [isLoadingMore]);

  // Show loading state for initial load
  if (!isLoading && data.length === 0) {
    return (
      <View
        className="flex-1 bg-background"
        style={{
          paddingTop: insets.top + 68,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </View>
    );
  }

  // Show empty state if no data
  if (!isLoading && data.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-6">
        <Text className="text-xl text-foreground text-center mb-2">
          No services found
        </Text>
        <Text className="text-sm text-foreground text-center">
          Try adjusting your search terms or check back laterr
        </Text>
      </View>
    );
  }

  return (
    <AnimatedFlatList
      data={data}
      keyExtractor={(_, index) => index.toString()}
      // Custom cell renderer provides itemY position to each item
      CellRendererComponent={CustomCellRendererComponent}
      renderItem={renderItem}
      onScroll={onScroll}
      scrollEventThrottle={16} // 60fps animation updates
      className="bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
      }}
      showsVerticalScrollIndicator={false}
      // Essential for iOS large title animation coordination
      contentInsetAdjustmentBehavior="automatic"
      // Pagination props
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3} // Trigger load more when 30% from the bottom
      ListFooterComponent={renderFooter}
      // Improve performance for mobile
      removeClippedSubviews={true}
      maxToRenderPerBatch={5} // Reduced for mobile performance
      updateCellsBatchingPeriod={50}
      initialNumToRender={8} // Optimized for mobile screen size
      windowSize={5} // Reduced window size for memory efficiency
      getItemLayout={undefined} // Disable for dynamic heights
      // Reduce memory pressure
      disableVirtualization={false}
      legacyImplementation={false}
    />
  );
};

// raycast-home-search-transition-animation 🔼
