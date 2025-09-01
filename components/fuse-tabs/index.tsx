import React, { FC, RefObject, useRef } from "react";
import { FlatList } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { TabIndicator } from "./tab-indicator";
import { TabItem } from "./tab-item";
import { Tab } from "~/types/fuse-tabs";
import { useMeasureFlatListTabsLayout } from "~/hooks/use-measure-flat-list-tabs-layout";
import * as Haptics from "expo-haptics";
import { View } from "../ui/view";
import { useRTL } from "~/hooks/useRTL";

// fuse-home-tabs-transition-animation 🔽

// Outer padding and gap feed into measurement math so indicator aligns precisely.
const _sidePadding = 16;
const _gap = 8;

type Props = {
  tabs: Tab[];
  horizontalListRef: RefObject<FlatList<any> | null>;
  horizontalListOffsetX: SharedValue<number>;
  isHorizontalListScrollingX: SharedValue<boolean>;
  activeTabIndex: SharedValue<number>;
  prevActiveTabIndex: SharedValue<number>;
};

export const TopTabs: FC<Props> = ({
  tabs,
  horizontalListRef,
  horizontalListOffsetX,
  isHorizontalListScrollingX,
  activeTabIndex,
  prevActiveTabIndex,
}) => {
  // Measures each tab width and its left offset accounting for padding/gaps.
  // Values are stored as shared arrays for fast UI-thread interpolation.
  const { tabWidths, tabOffsets } = useMeasureFlatListTabsLayout({
    tabsLength: tabs.length,
    sidePadding: _sidePadding,
    gap: _gap,
  });

  const tabsListRef = useRef<FlatList>(null);

  const { isRTL } = useRTL();

  // Tracks the tabs list scroll so the indicator can counter-translate.
  const tabsListOffsetX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      tabsListOffsetX.set(event.contentOffset.x);
    },
  });

  const _renderItem = ({ item, index }: { item: Tab; index: number }) => (
    <View className="items-center justify-center">
      <TabItem
        index={index}
        label={item.label}
        horizontalListOffsetX={horizontalListOffsetX}
        // Save previous index to detect long jumps and to control iOS-only fades elsewhere.
        onPressIn={() => prevActiveTabIndex.set(activeTabIndex.get())}
        onPressOut={() => {
          // Light haptic to confirm tab selection without being distracting.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          // Update the active index immediately; a small timeout mirrors the
          // list momentum and prevents flicker in cross-fade logic.
          activeTabIndex.set(item.value);
          setTimeout(() => {
            prevActiveTabIndex.set(item.value);
          }, 300);
          // Keep both the tabs bar and the content list in sync.
          tabsListRef.current?.scrollToIndex({ index, animated: true });
          horizontalListRef.current?.scrollToIndex({ index, animated: true });
        }}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          // Write width into shared array on UI thread; used by indicator width interpolation.
          tabWidths.modify((value) => {
            "worklet";
            value[index] = width;
            return value;
          });
        }}
      />
    </View>
  );

  return (
    <View>
      <TabIndicator
        activeTabIndex={activeTabIndex}
        tabBarOffsetX={tabsListOffsetX}
        tabWidths={tabWidths}
        tabOffsets={tabOffsets}
        horizontalListOffsetX={horizontalListOffsetX}
        isHorizontalListScrollingX={isHorizontalListScrollingX}
      />
      <Animated.FlatList
        ref={tabsListRef}
        inverted={isRTL}
        data={tabs}
        keyExtractor={(item) => item.value.toString()}
        renderItem={_renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        // Throttle aligned to ~60fps for smooth indicator compensation.
        scrollEventThrottle={1000 / 60}
        // Padding + gap must match measurement to keep offsets correct.
        contentContainerStyle={{ paddingHorizontal: _sidePadding, gap: _gap }}
        bounces={false}
      />
    </View>
  );
};

// fuse-home-tabs-transition-animation 🔼
