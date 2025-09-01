import React from "react";
import { View } from "~/components/ui/view";
import { useHeaderHeight } from "~/lib/use-header-height";
import { EditHomeButton } from "./edit-home-button";
import { SettingsButton } from "./settings-button";
import { ProfileButton } from "./profile-button";
import { TabAnimationConfig } from "~/types/tab-animation";
import HeaderFilterButton from "./headerFilterButton";

// raycast-home-search-transition-animation 🔽

interface DummyHeaderProps {
  config: TabAnimationConfig;
}

export const DummyHeader = ({ config }: DummyHeaderProps) => {
  const { insetTop, netHeight } = useHeaderHeight();

  return (
    <View
      className="absolute top-0 left-0 right-0"
      style={{ paddingTop: insetTop }}
    >
      <View
        className="flex-row items-center justify-center"
        style={{ height: netHeight }}
      >
        {config.hasFilter ? <HeaderFilterButton /> : <EditHomeButton />}
        <View className="flex-1" />
        <ProfileButton />
      </View>
    </View>
  );
};

// raycast-home-search-transition-animation 🔼
