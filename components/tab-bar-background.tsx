import { LinearGradient } from "expo-linear-gradient";
import React, { FC } from "react";
import { StyleSheet } from "react-native";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";

// Helper function to convert HSL to HSLA with opacity
const addOpacityToHSL = (hslColor: string, opacity: number): string => {
  // Extract values from "hsl(240 10% 3.9%)" format
  const match = hslColor.match(/hsl\((\d+)\s+(\d+)%\s+([\d.]+)%\)/);
  if (match) {
    const [, h, s, l] = match;
    return `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
  }
  return hslColor; // fallback
};

export const TabBarBackground: FC = () => {
  const { colorScheme } = useColorScheme();
  return (
    <LinearGradient
      style={StyleSheet.absoluteFill}
      colors={[
        "transparent",
        addOpacityToHSL(NAV_THEME[colorScheme].background, 0.8),

        NAV_THEME[colorScheme].background,
      ]}
      locations={[0, 0.35, 1]}
    />
  );
};
