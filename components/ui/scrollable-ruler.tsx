import React, { useCallback, useMemo, useState } from "react";
import { View, ScrollView, Dimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  runOnJS,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "./text";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";

const { width: screenWidth } = Dimensions.get("window");

interface ScrollableRulerProps {
  min: number;
  max: number;
  step?: number;
  onValueChange?: (value: number) => void;
  initialValue?: number;
  width?: number;
  height?: number;
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function ScrollableRuler({
  min,
  max,
  step = 1,
  onValueChange,
  initialValue = min,
  width,
  height = 80,
}: ScrollableRulerProps) {
  const { colorScheme } = useColorScheme();
  const [containerWidth, setContainerWidth] = useState(
    width || screenWidth - 32
  );

  const scrollX = useSharedValue(0);
  const tickWidth = 8; // Width of each tick
  const tickSpacing = 12; // Space between ticks
  const totalTickWidth = tickWidth + tickSpacing;

  // Calculate total content width
  const range = max - min;
  const numberOfTicks = Math.floor(range / step) + 1;
  const contentWidth = numberOfTicks * totalTickWidth;
  const paddingHorizontal = containerWidth / 2;

  // Generate tick data
  const ticks = useMemo(() => {
    const tickArray = [];
    for (let i = 0; i <= range; i += step) {
      const value = min + i;
      const isMainTick = value % (step * 5) === 0; // Every 5th tick is main
      const isMidTick = value % step === 0 && !isMainTick;

      tickArray.push({
        value,
        isMainTick,
        isMidTick,
        position: (i / step) * totalTickWidth,
      });
    }
    return tickArray;
  }, [min, step, range, totalTickWidth]);

  const handleValueChange = useCallback(
    (value: number) => {
      onValueChange?.(value);
    },
    [onValueChange]
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      "worklet";
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      "worklet";
      const adjustedPosition = event.contentOffset.x;
      const tickIndex = Math.round(adjustedPosition / totalTickWidth);
      const clampedIndex = Math.max(0, Math.min(tickIndex, numberOfTicks - 1));
      const currentValue = min + clampedIndex * step;
      runOnJS(handleValueChange)(currentValue);
    },
    onEndDrag: (event) => {
      "worklet";
      const adjustedPosition = event.contentOffset.x;
      const tickIndex = Math.round(adjustedPosition / totalTickWidth);
      const clampedIndex = Math.max(0, Math.min(tickIndex, numberOfTicks - 1));
      const currentValue = min + clampedIndex * step;
      runOnJS(handleValueChange)(currentValue);
    },
  });

  // Calculate initial scroll position
  const initialScrollPosition = useMemo(() => {
    const valueIndex = Math.floor((initialValue - min) / step);
    return valueIndex * totalTickWidth;
  }, [initialValue, min, step, totalTickWidth]);

  // Calculate the center line position - accounting for tick center
  const centerLinePosition = containerWidth / 2 + tickWidth / 2 - 1;

  const centerLineStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollX.value % totalTickWidth,
        [
          0,
          totalTickWidth / 4,
          totalTickWidth / 2,
          (3 * totalTickWidth) / 4,
          totalTickWidth,
        ],
        [1, 0.8, 0.6, 0.8, 1]
      ),
    };
  });

  const renderTick = (tick: (typeof ticks)[0], index: number) => {
    const tickHeight = tick.isMainTick ? 24 : tick.isMidTick ? 16 : 8;
    const showLabel = tick.isMainTick;

    return (
      <View
        key={index}
        style={{
          width: tickWidth,
          height: height,
          marginRight: tickSpacing,
          alignItems: "center",
          justifyContent: "flex-end",
        }}
        className="relative"
      >
        {showLabel && (
          <Text className="text-xs text-muted-foreground mb-1 absolute top-4 w-7 text-center">
            {tick.value}
          </Text>
        )}
        <View
          style={{
            width: 2,
            height: tickHeight,
            backgroundColor: tick.isMainTick
              ? NAV_THEME[colorScheme].muted
              : NAV_THEME[colorScheme].border,
            borderRadius: 1,
          }}
        />
      </View>
    );
  };

  return (
    <View
      style={{ width: width || "100%", height }}
      onLayout={(event) => {
        if (!width) {
          setContainerWidth(event.nativeEvent.layout.width);
        }
      }}
    >
      {/* Ruler container */}
      <View style={{ position: "relative", flex: 1 }}>
        <MaskedView
          maskElement={
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={["transparent", "black", "black", "transparent"]}
              locations={[0, 0.15, 0.85, 1]}
              style={StyleSheet.absoluteFill}
            />
          }
          style={{ flex: 1 }}
        >
          <AnimatedScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal,
            }}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            snapToInterval={totalTickWidth}
            snapToAlignment="start"
            decelerationRate="fast"
            contentOffset={{ x: initialScrollPosition, y: 0 }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
              {ticks.map(renderTick)}
            </View>
          </AnimatedScrollView>
        </MaskedView>

        {/* Center indicator line */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: centerLinePosition,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: NAV_THEME[colorScheme].primary,
              borderRadius: 1,
              zIndex: 10,
            },
            centerLineStyle,
          ]}
        />
      </View>
    </View>
  );
}
