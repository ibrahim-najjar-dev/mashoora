import React from "react";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SPRING_CONFIG } from "~/constants";
import { NAV_THEME } from "~/constants/Colors";
import { FilterUIConfig } from "~/constants/filter-config";
import { useColorScheme } from "~/lib/useColorScheme";
import { cn } from "~/lib/utils";
import { Filter } from "~/store/filters";
import { getSmartDisplayValue } from "~/utils/filter-helpers";
import { DynamicInput } from "../filter/dynamic-input";
import { Text } from "./text";

type FilterOptionProps = {
  filter: Filter;
  uiConfig: FilterUIConfig;
  index: number;
  isSelected: boolean;
  onSelect: (value: number) => void;
  onFilterChange: (key: string, value: any) => void;
};

const FilterOption: React.FC<FilterOptionProps> = ({
  filter,
  uiConfig,
  index,
  isSelected,
  onSelect,
  onFilterChange,
}) => {
  const { colorScheme } = useColorScheme();
  const displayValue = getSmartDisplayValue(filter);

  const measuredHeight = useSharedValue(0);

  const onLayout = (event: LayoutChangeEvent) => {
    measuredHeight.value = event.nativeEvent.layout.height;
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      height: withSpring(
        isSelected ? measuredHeight.value + 58 + 10 : 58,
        SPRING_CONFIG
      ),
    };
  }, [isSelected]);

  const animatedChildrenStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSelected ? 1 : 0, {
        duration: 250,
      }),
    };
  }, [isSelected]);

  const handlePress = () => {
    onSelect(index);
  };

  const handleValueChange = (value: any) => {
    onFilterChange(filter.key, value);
  };

  return (
    <Animated.View
      style={[animatedContainerStyle]}
      className={"bg-secondary rounded-xl overflow-hidden"}
    >
      <Pressable
        className="flex-row items-center justify-center px-4 h-[58px] overflow-hidden"
        onPress={handlePress}
      >
        {uiConfig.icon && (
          <View className="me-1">
            {React.createElement(uiConfig.icon, {
              size: 19,
              strokeWidth: 1.9,
              color: NAV_THEME[colorScheme].muted,
            })}
          </View>
        )}
        <Text className="ms-1 font-Geist_Medium">{uiConfig.label}</Text>
        <View className="flex-1 items-end">
          <Text
            className={cn("font-Mono_Medium text-muted-foreground", {
              "text-foreground": displayValue,
            })}
          >
            {displayValue || `All ${uiConfig.label.toLowerCase()}`}
          </Text>
        </View>
      </Pressable>

      <View
        style={animatedChildrenStyle}
        className="m-[5px] rounded-lg min-h-[120px] overflow-hidden bg-background"
        onLayout={onLayout}
      >
        <DynamicInput
          filter={filter}
          value={filter.value}
          onValueChange={handleValueChange}
        />
      </View>
    </Animated.View>
  );
};

export default FilterOption;
