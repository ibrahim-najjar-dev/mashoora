import React from "react";
import { View } from "~/components/ui/view";
import { AnimatedBlur } from "~/components/animated-blur";
import { AnimatedChevron } from "~/components/animated-chevron";
import { CommandsList } from "~/components/command-list";
import { DummyHeader } from "~/components/home-header";
import { RealHeader } from "~/components/real-header";
import {
  TAB_ANIMATION_CONFIGS,
  type AnimatedTabName,
} from "~/types/tab-animation";

type AnimatedHeaderSystemProps = {
  tabName: AnimatedTabName;
  children: React.ReactNode;
};

export const AnimatedHeaderSystem: React.FC<AnimatedHeaderSystemProps> = ({
  tabName,
  children,
}) => {
  const config = TAB_ANIMATION_CONFIGS[tabName];

  if (!config) {
    // Fallback for non-animated tabs
    return <View className="flex-1 bg-background">{children}</View>;
  }

  return (
    <View className="flex-1 bg-background">
      {children}
      {config.hasAnimatedHeader && <DummyHeader config={config} />}
      {config.hasBlurEffect && <AnimatedBlur />}
      {config.hasCommandsList && <CommandsList />}
      {config.hasAnimatedHeader && <AnimatedChevron />}
      {config.hasAnimatedHeader && <RealHeader config={config} />}
    </View>
  );
};
