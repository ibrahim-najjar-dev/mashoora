import React, { FC } from "react";
import { LayoutChangeEvent, useWindowDimensions } from "react-native";
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { Pressable } from "../ui/pressable";
import { AnimatedTextRTL } from "../ui/animated-text-rtl";

// fuse-home-tabs-transition-animation 🔽

// Muted → active → muted colors for a subtle spotlight effect as the page center crosses a tab.

export type TabItemProps = {
  index: number;
  label: string;
  horizontalListOffsetX: SharedValue<number>;
  onPressIn: () => void;
  onPressOut: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
};

export const TabItem: FC<TabItemProps> = ({
  index,
  label,
  horizontalListOffsetX,
  onPressIn,
  onPressOut,
  onLayout,
}) => {
  const { colorScheme } = useColorScheme();

  const _defaultColor = NAV_THEME[colorScheme].muted;
  const _activeColor = NAV_THEME[colorScheme].text;

  // Width drives the normalization of horizontalListOffsetX into page progress.
  const { width } = useWindowDimensions();

  const rTextStyle = useAnimatedStyle(() => {
    const progress = horizontalListOffsetX.get() / width;

    return {
      // Three-point interpolation: [index-1, index, index+1]
      // Output: default → active → default to highlight only the focused tab.
      color: interpolateColor(
        progress,
        [index - 1, index, index + 1],
        [_defaultColor, _activeColor, _defaultColor]
      ),
    };
  });

  return (
    <Pressable
      className="py-2 px-1"
      // onPressIn saves previous index upstream for jump detection; onPressOut drives scroll.
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onLayout={onLayout}
    >
      <AnimatedTextRTL style={rTextStyle} className="font-Geist_Bold text-lg">
        {label}
        {/* <AnimatedTextRTL style={rTextStyle} className="text-xs font-Mono_Bold">
          8
        </AnimatedTextRTL> */}
      </AnimatedTextRTL>
    </Pressable>
  );
};

// fuse-home-tabs-transition-animation 🔼
