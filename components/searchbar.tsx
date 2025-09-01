import { Search } from "lucide-react-native";
import React, { FC, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import {
  SEARCHBAR_COMMANDS_WIDTH,
  SEARCHBAR_FAVORITES_WIDTH,
  SEARCHBAR_HEIGHT,
  TRIGGER_DRAG_DISTANCE,
  useHomeAnimation,
} from "~/lib/home-animation-provider";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { useTranslation } from "react-i18next";

// raycast-home-search-transition-animation 🔽

export const Searchbar: FC = () => {
  const {
    screenView,
    offsetY,
    isListDragging,
    inputRef,
    onGoToCommands,
    isAnimationEnabled,
    searchQuery,
    setSearchQuery,
  } = useHomeAnimation();

  const { colorScheme } = useColorScheme();

  const { t } = useTranslation();

  const rContainerStyle = useAnimatedStyle(() => {
    if (
      isAnimationEnabled.value &&
      isListDragging.value &&
      offsetY.value < 0 &&
      offsetY.value < TRIGGER_DRAG_DISTANCE
    ) {
      return {
        transformOrigin: "center",
        transform: [{ scale: withTiming(1.05) }],
      };
    }

    return {
      width: withSpring(
        screenView.value === "favorites"
          ? SEARCHBAR_FAVORITES_WIDTH
          : SEARCHBAR_COMMANDS_WIDTH,
        {
          mass: 0.2,
          damping: 15,
        }
      ),
      transform: [{ scale: withTiming(1) }],
      transformOrigin: isListDragging.value ? "center" : "right",
    };
  });

  return (
    <Animated.View className="justify-center z-[9]" style={rContainerStyle}>
      <TextInput
        ref={inputRef}
        placeholder={t("search.placeholder")}
        placeholderTextColor={NAV_THEME[colorScheme].muted}
        className="dark:bg-neutral-800 text-foreground bg-neutral-200 pl-10 pr-3 rounded-2xl text-base/5"
        style={styles.input}
        selectionColor="#e5e5e5"
        onFocus={onGoToCommands}
        // onchangeText={(text) => setSearchQuery(text)}
        onSubmitEditing={(e) => {
          // set search query
          setSearchQuery(e.nativeEvent.text);
        }}
      />
      <View className="absolute left-3">
        <Search size={16} color={NAV_THEME[colorScheme].muted} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: SEARCHBAR_HEIGHT,
    borderCurve: "continuous",
  },
});

// raycast-home-search-transition-animation 🔼
