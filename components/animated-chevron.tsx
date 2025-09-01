import { ChevronDown } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  TRIGGER_DRAG_DISTANCE,
  useHomeAnimation,
} from "~/lib/home-animation-provider";
import { useHeaderHeight } from "~/lib/use-header-height";

// raycast-home-search-transition-animation 🔽

export const AnimatedChevron = () => {
  const { grossHeight } = useHeaderHeight();

  const { offsetY, isAnimationEnabled } = useHomeAnimation();

  const rContainerStyle = useAnimatedStyle(() => {
    if (!isAnimationEnabled.value) {
      return {
        height: 0,
        opacity: 0,
      };
    }

    return {
      height: interpolate(
        offsetY.value,
        [0, TRIGGER_DRAG_DISTANCE],
        [0, Math.abs(TRIGGER_DRAG_DISTANCE)]
      ),
      opacity: interpolate(
        offsetY.value,
        [0, TRIGGER_DRAG_DISTANCE],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <Animated.View
      className="absolute left-0 right-0 items-center justify-center pointer-events-none"
      style={[{ top: grossHeight }, rContainerStyle]}
    >
      <View style={{ transform: [{ scaleX: 2 }] }}>
        <ChevronDown size={16} color="#a3a3a3" />
      </View>
    </Animated.View>
  );
};

// raycast-home-search-transition-animation 🔼
