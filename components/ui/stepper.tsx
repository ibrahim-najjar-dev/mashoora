import React from "react";
import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";

interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
  duration?: number;
  showLabels?: boolean;
}

interface StepLineProps {
  index: number;
  currentStep: number;
  duration: number;
}

const StepLine = ({ index, currentStep, duration }: StepLineProps) => {
  const { colorScheme } = useColorScheme();

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = index === currentStep;
    const isCompleted = index < currentStep;
    const shouldFill = isCompleted || isActive;

    const backgroundColor = withTiming(
      shouldFill
        ? NAV_THEME[colorScheme].primary
        : NAV_THEME[colorScheme].border,
      {
        duration,
        easing: Easing.out(Easing.cubic),
      }
    );

    return {
      backgroundColor,
    };
  });

  return (
    <Animated.View className="flex-1 h-1 rounded-full" style={animatedStyle} />
  );
};

export const Stepper = ({
  steps,
  currentStep,
  className = "",
  duration = 400,
  showLabels = true,
}: StepperProps) => {
  return (
    <View className={`w-full ${className}`}>
      {/* Step labels - optional */}
      {showLabels && (
        <View className="flex-row justify-between mb-4 px-4">
          {steps.map((stepLabel, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <View key={index} className="items-center flex-1">
                <Text
                  className={`text-sm font-semibold ${
                    isCompleted || isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {stepLabel}
                </Text>
                <Text
                  className={`text-xs mt-1 ${
                    isCompleted || isActive
                      ? "text-primary/70"
                      : "text-muted-foreground/60"
                  }`}
                >
                  Step {index + 1}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Step line indicators */}
      <View className="flex-row justify-between mx-4 gap-2">
        {steps.map((_, index) => (
          <StepLine
            key={index}
            index={index}
            currentStep={currentStep}
            duration={duration}
          />
        ))}
      </View>
    </View>
  );
};
