import React, { FC } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { AnimatedView } from "../ui/animated-view";
import { useRTL } from "~/hooks/useRTL";

// fuse-home-tabs-transition-animation 🔽

// Duration for tap-driven indicator moves; short to feel snappy but noticeable.
const _duration = 250;

type Props = {
  activeTabIndex: SharedValue<number>;
  tabWidths: SharedValue<number[]>;
  tabOffsets: SharedValue<number[]>;
  tabBarOffsetX: SharedValue<number>;
  horizontalListOffsetX: SharedValue<number>;
  isHorizontalListScrollingX: SharedValue<boolean>;
};

export const TabIndicator: FC<Props> = ({
  activeTabIndex,
  tabWidths,
  tabOffsets,
  tabBarOffsetX,
  horizontalListOffsetX,
  isHorizontalListScrollingX,
}) => {
  const { width: windowWidth } = useWindowDimensions();

  const { isRTL } = useRTL();

  const rIndicatorStyle = useAnimatedStyle(() => {
    // While dragging pages, indicator position/width track the content directly
    // via interpolation across tab indices; when not dragging, we animate to
    // the target index with a timed transition.
    const left = isHorizontalListScrollingX.get()
      ? interpolate(
          horizontalListOffsetX.get() / windowWidth,
          Object.keys(tabOffsets.get()).map(Number),
          tabOffsets.get()
        )
      : withTiming(tabOffsets.get()[activeTabIndex.get()], {
          duration: _duration,
        });

    const width = isHorizontalListScrollingX.get()
      ? interpolate(
          horizontalListOffsetX.get() / windowWidth,
          Object.keys(tabWidths.get()).map(Number),
          tabWidths.get()
        )
      : withTiming(tabWidths.get()[activeTabIndex.get()], {
          duration: _duration,
        });

    return {
      left,
      width,
      transform: [
        {
          // Compensate for the tabs list own horizontal scroll so the indicator
          // stays visually anchored under the active tab.
          translateX: isRTL ? tabBarOffsetX.get() : -tabBarOffsetX.get(),
        },
        {
          // Slight compression to reduce visual weight of the underline.
          scaleX: 0.5,
        },
      ],
    };
  });

  return (
    <AnimatedView
      className="absolute h-[2px] bottom-0 rounded-full bg-white"
      style={rIndicatorStyle}
    />
  );
};

// fuse-home-tabs-transition-animation 🔼
