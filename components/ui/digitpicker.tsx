import { useState, useMemo } from "react";
import { TextInput, Pressable } from "react-native";
import Animated, {
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";
import AnimatedText from "./animated-text";
import { ChildProps } from "./filter-option";
import { Text } from "./text";
import { View } from "./view";
import ScrollableRuler from "./scrollable-ruler";

export default function DigitPicker({ handleChange, value }: ChildProps) {
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);
  const [activeInput, setActiveInput] = useState<"min" | "max">("min");
  const [isRangeMode, setIsRangeMode] = useState(false);

  const handleRulerChange = (newValue: number) => {
    if (isRangeMode) {
      if (activeInput === "min") {
        setMinValue(newValue);
        handleChange?.(`${newValue}-${maxValue}`);
      } else {
        setMaxValue(newValue);
        handleChange?.(`${minValue}-${newValue}`);
      }
    } else {
      // Single value mode
      setMinValue(newValue);
      handleChange?.(newValue.toString());
    }
  };

  const toggleRangeMode = () => {
    setIsRangeMode(!isRangeMode);
    if (!isRangeMode) {
      // Switching to range mode
      setMaxValue(minValue + 50); // Set a default max
      handleChange?.(`${minValue}-${minValue + 50}`);
    } else {
      // Switching to single value mode
      handleChange?.(minValue.toString());
    }
  };

  const selectInput = (input: "min" | "max") => {
    setActiveInput(input);
  };

  // Memoized animation styles for the numbers to reduce re-renders
  const minTextStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: withSpring(isRangeMode && activeInput === "min" ? 1.1 : 1, {
            damping: 20,
          }),
        },
      ],
      opacity: withSpring(isRangeMode && activeInput === "max" ? 0.5 : 1, {
        damping: 20,
      }),
    }),
    [isRangeMode, activeInput]
  );

  const maxTextStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: withSpring(isRangeMode && activeInput === "max" ? 1.1 : 1, {
            damping: 20,
          }),
        },
      ],
      opacity: withSpring(isRangeMode && activeInput === "min" ? 0.5 : 1, {
        damping: 20,
      }),
    }),
    [isRangeMode, activeInput]
  );

  return (
    <View className="">
      {/* Range Toggle */}
      <View className="flex-row justify-center mb-4">
        <Pressable
          onPress={toggleRangeMode}
          className={`px-4 py-2 rounded-lg ${
            isRangeMode ? "bg-primary" : "bg-muted"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              isRangeMode ? "text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {isRangeMode ? "Range Mode" : "Single Value"}
          </Text>
        </Pressable>
      </View>

      {/* Animated Numbers */}
      <View className="py-4" style={{ height: 120 }}>
        {isRangeMode ? (
          <View
            className="flex-row justify-center items-center"
            style={{ gap: 16 }}
          >
            <Pressable
              onPress={() => selectInput("min")}
              style={{ minWidth: 80 }}
            >
              <Animated.View style={minTextStyle} className="items-center">
                <Text className="text-5xl font-bold text-foreground">
                  {minValue}
                </Text>
              </Animated.View>
            </Pressable>

            <View style={{ paddingHorizontal: 8 }}>
              <Text className="text-2xl text-muted-foreground font-bold">
                -
              </Text>
            </View>

            <Pressable
              onPress={() => selectInput("max")}
              style={{ minWidth: 80 }}
            >
              <Animated.View style={maxTextStyle} className="items-center">
                <Text className="text-5xl font-bold text-foreground">
                  {maxValue}
                </Text>
              </Animated.View>
            </Pressable>
          </View>
        ) : (
          <View className="justify-center items-center">
            <AnimatedText size={76}>{minValue.toString()}</AnimatedText>
          </View>
        )}
      </View>

      {/* Scrollable Ruler */}
      <View className="mt-1">
        <ScrollableRuler
          key={`${isRangeMode}-${activeInput}`}
          min={0}
          max={1000}
          step={5}
          initialValue={activeInput === "min" ? minValue : maxValue}
          onValueChange={handleRulerChange}
          height={60}
        />
      </View>

      {/* Active Input Indicator */}
      {isRangeMode && (
        <View className="mt-2 flex-row justify-center">
          <Text className="text-xs text-muted-foreground">
            Adjusting: {activeInput === "min" ? "Minimum" : "Maximum"} value
          </Text>
        </View>
      )}

      {/* Keep the TextInput for manual input if needed */}
    </View>
  );
}
