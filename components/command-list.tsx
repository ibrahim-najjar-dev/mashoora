import React from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
// import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FULL_DRAG_DISTANCE,
  TRIGGER_DRAG_DISTANCE,
  useHomeAnimation,
} from "~/lib/home-animation-provider";
import { useHeaderHeight } from "~/lib/use-header-height";
import { TopGradient } from "./top-gradient";
import { Text } from "./ui/text";
// import { simulatePress } from "@/src/shared/lib/utils/simulate-press";

// raycast-home-search-transition-animation 🔽

const CommandItem = () => {
  const randomWidth = React.useMemo(
    () => Math.floor(Math.random() * 151) + 50,
    []
  );

  return (
    <Pressable className="flex-row items-center gap-3">
      <View className="w-8 h-8 rounded-xl bg-orange-800" />
      <View
        className="h-3 rounded-full bg-neutral-200/25"
        style={{ width: randomWidth }}
      />
    </Pressable>
  );
};

export const CommandsList = () => {
  const insets = useSafeAreaInsets();

  const { grossHeight, netHeight } = useHeaderHeight();

  const { screenView, offsetY, isAnimationEnabled } = useHomeAnimation();

  const rContainerStyle = useAnimatedStyle(() => {
    // Hide completely if animation is disabled
    if (!isAnimationEnabled.value) {
      return {
        opacity: 0,
        pointerEvents: "none",
        transform: [{ translateY: -offsetY.value }],
      };
    }

    return {
      opacity:
        screenView.value === "commands"
          ? 1
          : interpolate(
              offsetY.value,
              [FULL_DRAG_DISTANCE * 0.2, FULL_DRAG_DISTANCE],
              [0, 1],
              Extrapolation.CLAMP
            ),
      transform: [{ translateY: -offsetY.value }],
      pointerEvents: screenView.value === "commands" ? "auto" : "none",
    };
  });

  const rTopGradientStyle = useAnimatedStyle(() => {
    return {
      opacity:
        isAnimationEnabled.value &&
        screenView.value === "commands" &&
        offsetY.value > TRIGGER_DRAG_DISTANCE
          ? withTiming(1, { duration: 1000 })
          : 0,
    };
  });

  return (
    <Animated.View className="absolute w-full h-full" style={rContainerStyle}>
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <FlatList
          data={Array.from({ length: 30 })}
          renderItem={() => <CommandItem />}
          keyExtractor={(_, index) => index.toString()}
          className="flex-1"
          ListHeaderComponent={
            <Text className="text-foreground font-Geist_Medium text-lg">
              Recent
            </Text>
          }
          contentContainerClassName="gap-4 px-5"
          contentContainerStyle={{
            paddingTop: grossHeight + 20,
            paddingBottom: insets.bottom + 8,
          }}
          indicatorStyle="white"
          scrollIndicatorInsets={{ top: netHeight + 16 }}
        />
      </KeyboardAvoidingView>
      <Animated.View
        style={[
          rTopGradientStyle,
          StyleSheet.absoluteFillObject,
          { height: grossHeight },
        ]}
      >
        <TopGradient />
      </Animated.View>
    </Animated.View>
  );
};

// raycast-home-search-transition-animation 🔼
