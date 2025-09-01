import React from "react";
import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";

interface MinimalStepperProps {
  totalSteps: number;
  currentStep: number;
  className?: string;
  duration?: number;
  showLabels?: boolean;
  labels?: string[];
}

export const MinimalStepper = ({
  totalSteps,
  currentStep,
  className = "",
  duration = 500,
  showLabels = false,
  labels,
}: MinimalStepperProps) => {
  const { colorScheme } = useColorScheme();

  const animatedStyle = useAnimatedStyle(() => {
    const progress = totalSteps > 1 ? currentStep / (totalSteps - 1) : 0;
    const width = withTiming(progress * 100, {
      duration,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    return {
      width: `${width}%`,
    };
  });

  return (
    <View className={`w-full ${className}`}>
      {showLabels && labels && (
        <View className="flex-row justify-between mb-3 px-2">
          {labels.map((label, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <Text
                key={index}
                className={`text-xs font-medium ${
                  isCompleted || isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </Text>
            );
          })}
        </View>
      )}

      {/* Simple progress line */}
      <View className="relative">
        {/* Background line */}
        <View
          className="h-1 w-full rounded-full"
          style={{ backgroundColor: NAV_THEME[colorScheme].border }}
        />

        {/* Animated progress line with gradient effect */}
        <Animated.View
          className="absolute top-0 h-1 rounded-full"
          style={[
            {
              backgroundColor: NAV_THEME[colorScheme].primary,
              shadowColor: NAV_THEME[colorScheme].primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 2,
            },
            animatedStyle,
          ]}
        />
      </View>

      {/* Step counter */}
      {!showLabels && (
        <View className="flex-row justify-center mt-3">
          <Text className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </Text>
        </View>
      )}
    </View>
  );
};
