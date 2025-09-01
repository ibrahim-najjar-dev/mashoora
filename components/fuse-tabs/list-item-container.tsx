import { BlurView } from "expo-blur";
import React, { FC, PropsWithChildren } from "react";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
} from "react-native-reanimated";

// fuse-home-tabs-transition-animation 🔽

// createAnimatedComponent allows BlurView props to be driven from UI thread
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Horizontal/vertical gaps applied during cross-fade/slide to avoid a flat swap.
// _translateXGap (20px) pulls cards slightly toward center; _translateYGap (5px)
// adds a subtle parallax lift. These are aesthetic “magic numbers” tuned by eye.
const _translateXGap = 20;
const _translateYGap = 5;

type Props = {
  index: number;
  activeTabIndex: SharedValue<number>;
  prevActiveTabIndex: SharedValue<number>;
  horizontalListOffsetX: SharedValue<number>;
  isHorizontalListScrollingX: SharedValue<boolean>;
};

export const HomeListItemContainer: FC<PropsWithChildren<Props>> = ({
  children,
  index,
  activeTabIndex,
  prevActiveTabIndex,
  horizontalListOffsetX,
  isHorizontalListScrollingX,
}) => {
  const { width } = useWindowDimensions();

  const rContainerStyle = useAnimatedStyle(() => {
    // Android fallback: avoid layered fades + blur while paging
    // (perf cost on Android GPU). iOS gets full treatment below.
    if (Platform.OS === "android") {
      return {};
    }

    // Skip rendering offscreen when the tab jump spans >1 page and we're not
    // currently dragging. This prevents flashing during programmatic jumps.
    if (
      Math.abs(activeTabIndex.get() - prevActiveTabIndex.get()) > 1 &&
      index !== activeTabIndex.get() &&
      !isHorizontalListScrollingX.get()
    ) {
      return { opacity: 0 };
    }

    // Convert pixel offset to page progress for interpolation math.
    const progress = horizontalListOffsetX.get() / width;

    // Opacity cross-fade: current page fades out over 70% of a page width,
    // next page fades in over the final 30%. CLAMP prevents overshooting.
    const fadeOut = interpolate(
      progress,
      [index, index + 0.7],
      [1, 0],
      Extrapolation.CLAMP
    );
    const fadeIn = interpolate(
      progress,
      [index - 0.3, index],
      [0, 1],
      Extrapolation.CLAMP
    );

    // X parallax: outgoing slides right by 70% width minus a small gap so it
    // doesn't look like a rigid snap; incoming slides from left by 30% width
    // plus a small gap toward center.
    const translateXOut = interpolate(
      progress,
      [index, index + 0.7],
      [0, width * 0.7 - _translateXGap],
      Extrapolation.CLAMP
    );
    const translateXIn = interpolate(
      progress,
      [index - 0.3, index],
      [-width * 0.3 + _translateXGap, 0],
      Extrapolation.CLAMP
    );

    // Y parallax: small vertical lift while transitioning to add depth.
    const translateYOut = interpolate(
      progress,
      [index, index + 0.7],
      [0, -_translateYGap],
      Extrapolation.CLAMP
    );
    const translateYIn = interpolate(
      progress,
      [index - 0.3, index],
      [-_translateYGap, 0],
      Extrapolation.CLAMP
    );

    return {
      // Multiply fades to create a quick cross-dissolve at the midpoint.
      opacity: fadeOut * fadeIn,
      transform: [
        {
          translateX: translateXOut + translateXIn,
        },
        {
          translateY: translateYOut + translateYIn,
        },
      ],
    };
  });

  const blurAnimatedProps = useAnimatedProps(() => {
    // Blur intensity: sharp at the focused tab (center), blurred for neighbors.
    // Interpolates across three pages: [prev, current, next] with CLAMP.
    const intensity = interpolate(
      horizontalListOffsetX.get(),
      [(index - 1) * width, index * width, (index + 1) * width],
      [75, 0, 75],
      Extrapolation.CLAMP
    );

    return {
      intensity,
    };
  });

  return (
    // Absolute BlurView overlays the item; pointerEvents=none lets touches pass.
    <Animated.View
      style={[{ width }, rContainerStyle]}
      className="bg-background"
    >
      {children}
      <AnimatedBlurView
        tint="dark"
        style={[StyleSheet.absoluteFill, styles.container]}
        animatedProps={blurAnimatedProps}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    pointerEvents: "none",
  },
});

// fuse-home-tabs-transition-animation 🔼
