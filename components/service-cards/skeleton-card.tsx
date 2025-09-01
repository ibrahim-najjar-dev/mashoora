import { StyleSheet } from "react-native";
import { Skeleton } from "~/components/ui/skeleton";
import { View } from "~/components/ui/view";

// Fixed item height to match service card
export const SKELETON_ITEM_HEIGHT = 170;

export const SkeletonCard = () => {
  return (
    <View
      className="w-full items-center px-4 py-[5px] overflow-hidden"
      style={[styles.container]}
    >
      <View className="flex-1 p-2 flex-row gap-2 bg-secondary rounded-3xl border border-neutral-700/15">
        {/* Left side - Avatar and rating */}
        <View className="py-2 px-2 gap-3 items-center justify-between">
          {/* Avatar skeleton */}
          <Skeleton className="w-10 h-10 rounded-2xl bg-neutral-800" />

          {/* Rating section skeleton */}
          <View className="flex-col items-center gap-1">
            <Skeleton className="w-5 h-5" />
            {/* <Skeleton className="w-6 h-3 rounded-sm" /> */}
          </View>
        </View>

        {/* Right side - Main content */}
        <View
          className="flex-1 bg-neutral-900/50 rounded-2xl px-3 py-2 items-stretch"
          style={styles.imageContainer}
        >
          <View className="flex-1">
            {/* Service name skeleton */}
            <View className="justify-end items-end py-1">
              <Skeleton className="w-3/4 h-6 mb-1 rounded-2xl" />
            </View>

            {/* Badges row skeleton */}
            <View className="flex-row items-center gap-2 mt-1 flex-wrap">
              {/* Category badge skeleton */}

              {/* Duration badge skeleton */}
              <View className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1 border border-border">
                <View className="flex-row gap-x-1.5 items-center">
                  <Skeleton className="w-3 h-3 rounded-sm" />
                  <Skeleton className="w-8 h-3" />
                </View>
              </View>

              {/* Experience badge skeleton */}
              <View className="flex-row items-center px-1.5 rounded-md py-1 border border-border">
                <View className="flex-row gap-x-1.5 items-center">
                  <Skeleton className="w-3 h-3 rounded-sm" />
                  <Skeleton className="w-10 h-3" />
                </View>
              </View>

              {/* Language badge skeleton */}
              <View className="flex-row items-center px-1.5 rounded-md py-1 border border-border">
                <View className="flex-row gap-x-1.5 items-center">
                  <Skeleton className="w-3 h-3 rounded-sm" />
                  <Skeleton className="w-16 h-3" />
                </View>
              </View>
            </View>
          </View>

          {/* Bottom section - availability and price */}
          <View className="flex-row justify-between items-end gap-x-2">
            <View className="flex-1">
              {/* Availability text skeleton */}
              <View>
                <Skeleton className="w-20 h-3" />
              </View>
            </View>

            {/* Price section skeleton */}
            <View className="flex-row items-center gap-x-1.5">
              <Skeleton className="w-9 h-8 rounded" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SKELETON_ITEM_HEIGHT,
    borderCurve: "continuous",
  },
  imageContainer: {
    borderCurve: "continuous",
  },
});
