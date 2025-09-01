import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import React, { useRef } from "react";
import { FlatList, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TopTabs } from "~/components/fuse-tabs";
import { HomeListItemContainer } from "~/components/fuse-tabs/list-item-container";
import Upcoming from "~/components/fuse-tabs/upcoming";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import Icons from "~/components/ui/icons";
import { Text } from "~/components/ui/text";
import { View } from "~/components/ui/view";
import { NAV_THEME } from "~/constants/Colors";
import { api } from "~/convex/_generated/api";
import { useAndroidNote } from "~/hooks/use-android-note";
import { useColorScheme } from "~/lib/useColorScheme";

import { Tab, TabValue } from "~/types/fuse-tabs";

// bookings.tsx
const tabs: Tab[] = [
  {
    label: "Upcoming",
    value: TabValue.Dashboard,
    content: <Upcoming />,
  },
  {
    label: "History",
    value: TabValue.Coins,
    content: <View className="flex-1" />,
  },
  {
    label: "Cancelled",
    value: TabValue.NFTs,
    content: <View className="flex-1" />,
  },
];

const Search = () => {
  const { userId } = useAuth();

  const user = useQuery(api.user.getUserByClerkId, {
    clerkUserId: userId!,
  });

  const { colorScheme } = useColorScheme();
  // Android shows a simplified transition (no complex blur/layering) for smoother perf.
  // iOS retains richer motion/blur until an Android-optimized path is found.
  useAndroidNote(
    "Performance of tabs transition animation is not optimal. There is a safe fallback for android platform until I found a better solution."
  );

  const horizontalListRef = useRef<FlatList>(null);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Shared values used across TopTabs, TabIndicator and item containers.
  // They coordinate cross-fade/slide (content) and underline (tabs) in sync.
  const horizontalListOffsetX = useSharedValue(0);
  const isHorizontalListScrollingX = useSharedValue(false);
  const prevActiveTabIndex = useSharedValue(0);
  const activeTabIndex = useSharedValue(0);

  // Single scroll handler keeps all animations on UI thread.
  // onBeginDrag toggles a live-follow mode for the indicator; onMomentumEnd snaps state.
  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      isHorizontalListScrollingX.set(true);
    },
    onScroll: (event) => {
      horizontalListOffsetX.set(event.contentOffset.x);
    },
    onMomentumEnd: (event) => {
      isHorizontalListScrollingX.set(false);
      activeTabIndex.set(Math.round(event.contentOffset.x / width));
    },
  });

  const _renderItem = ({ item, index }: { item: Tab; index: number }) => {
    return (
      <HomeListItemContainer
        index={index}
        activeTabIndex={activeTabIndex}
        prevActiveTabIndex={prevActiveTabIndex}
        horizontalListOffsetX={horizontalListOffsetX}
        isHorizontalListScrollingX={isHorizontalListScrollingX}
      >
        {item.content}
      </HomeListItemContainer>
    );
  };

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row items-center px-7 mb-4">
        <View className="flex-1 flex-row items-center gap-3">
          <Avatar className="w-12 h-12 bg-neutral-500" alt="profile">
            <AvatarImage source={{ uri: user?.imageUrl }} />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <View className="gap-0.5">
            <Text className="text-foreground font-Geist_SemiBold text-lg">
              {user?.firstName + " " + user?.lastName}
            </Text>
            <Text className="text-sm text-muted-foreground font-Mono_Medium">
              {user?.phonenumber}
            </Text>
          </View>
        </View>

        <Button className="" size={"icon"} variant={"secondary"}>
          <Icons.SolarInboxBoldDuotone
            width={24}
            height={24}
            color={NAV_THEME[colorScheme].text}
          />
        </Button>
      </View>
      <TopTabs
        tabs={tabs}
        horizontalListRef={horizontalListRef}
        horizontalListOffsetX={horizontalListOffsetX}
        isHorizontalListScrollingX={isHorizontalListScrollingX}
        activeTabIndex={activeTabIndex}
        prevActiveTabIndex={prevActiveTabIndex}
      />
      <View className="flex-1">
        <Animated.FlatList
          ref={horizontalListRef}
          data={tabs}
          renderItem={_renderItem}
          keyExtractor={(item) => item.value.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          decelerationRate="fast"
          onScroll={scrollHandler}
          // 16ms (~60fps) ensures smooth interpolation updates during drag.
          scrollEventThrottle={16}
          // Disable bounce to keep interpolation bounds stable at page edges.
          bounces={false}
        />
      </View>
    </View>
  );
};

export default Search;
