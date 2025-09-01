import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { useWindowDimensions } from "react-native";
import { useRTL } from "./useRTL";

type Props = {
  tabsLength: number; // Total number of tabs for array initialization
  sidePadding: number; // Horizontal padding affecting first tab position
  gap: number; // Space between tabs used in offset calculations
};

/**
 * Dynamic tab layout measurement system for responsive indicator positioning
 * Calculates tab positions and widths for smooth animations
 */
export const useMeasureFlatListTabsLayout = ({
  tabsLength,
  sidePadding,
  gap,
}: Props) => {
  const { width: windowWidth } = useWindowDimensions();
  const { isRTL } = useRTL();

  // CRITICAL: Tab widths must be measured via onLayout in each tab component:
  // onLayout={(event) => {
  //   const { width } = event.nativeEvent.layout;
  //   tabWidths.modify((value) => {
  //     "worklet"; // Enables UI thread updates for smooth animations
  //     value[index] = width; // Updates shared array for indicator calculations
  //     return value;
  //   });
  // }}

  // Shared array stores actual measured tab widths (initially 0, updated via onLayout)
  const tabWidths = useSharedValue<number[]>(new Array(tabsLength).fill(0));

  // Derived value automatically recalculates tab positions when widths change
  const tabOffsets = useDerivedValue(() => {
    const ltrOffsets = tabWidths.value.reduce<number[]>(
      (acc, _width, index) => {
        // Calculate left position for each tab based on previous tabs
        const previousX = index === 0 ? sidePadding : acc[index - 1]; // Start with padding or previous position
        const previousWidth = index === 0 ? 0 : tabWidths.value[index - 1]; // No width for first tab calculation

        // Formula: previousPosition + previousWidth + gap (except first tab)
        acc[index] = previousX + previousWidth + (index === 0 ? 0 : gap);
        return acc;
      },
      []
    );

    // If RTL, convert LTR offsets to RTL positions
    if (isRTL) {
      // Calculate total content width
      const totalContentWidth =
        ltrOffsets[ltrOffsets.length - 1] +
        tabWidths.value[tabWidths.value.length - 1] +
        sidePadding;

      // Convert each LTR offset to RTL position
      return ltrOffsets.map((ltrOffset, index) => {
        const tabWidth = tabWidths.value[index];
        return windowWidth - (ltrOffset + tabWidth);
      });
    }

    return ltrOffsets;
  });

  return { tabWidths, tabOffsets };
};
