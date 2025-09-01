import React, { FC } from "react";
import { View } from "~/components/ui/view";
import { AnimatedView } from "~/components/ui/animated-view";
import { useHeaderHeight } from "~/lib/use-header-height";
import { CancelButton } from "./cancel-button";
import { Searchbar } from "./searchbar";
// import { EditHomeButton } from "./edit-home-button";
import {
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useHomeAnimation } from "~/lib/home-animation-provider";
import { EditHomeButton } from "./edit-home-button";
import { SettingsButton } from "./settings-button";
import { ProfileButton } from "./profile-button";
import { Image } from "expo-image";
import { TabAnimationConfig } from "~/types/tab-animation";
import HeaderFilterButton from "./headerFilterButton";

// raycast-home-search-transition-animation 🔽

interface RealHeaderProps {
  config: TabAnimationConfig;
}

export const RealHeader: FC<RealHeaderProps> = ({ config }) => {
  const { insetTop, netHeight } = useHeaderHeight();
  const { offsetY, screenView, isAnimationEnabled } = useHomeAnimation();

  const rSideButtonsContainerStyle = useAnimatedStyle(() => {
    if (
      !isAnimationEnabled.value ||
      offsetY.value < 0 ||
      screenView.value === "commands"
    ) {
      return {
        opacity: 0,
        pointerEvents: "none",
      };
    }

    return {
      opacity: withDelay(300, withTiming(1, { duration: 0 })),
      pointerEvents: "auto",
    };
  });

  return (
    <View
      className="absolute top-0 w-full flex-row items-center justify-end z-[999]"
      style={{ paddingTop: insetTop, pointerEvents: "box-none" }}
    >
      <AnimatedView
        className="absolute w-full flex-row items-center justify-center"
        style={[
          rSideButtonsContainerStyle,
          { height: netHeight, top: insetTop },
        ]}
      >
        {config.hasFilter ? <HeaderFilterButton /> : <EditHomeButton />}
        <View className="flex-1" />
        <ProfileButton />
      </AnimatedView>
      <Searchbar />
      <CancelButton />
    </View>
  );
};

// raycast-home-search-transition-animation 🔼
