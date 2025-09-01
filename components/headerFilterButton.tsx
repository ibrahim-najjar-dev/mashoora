import { Image } from "expo-image";
import { Settings2 } from "lucide-react-native";
import React, { FC, useState } from "react";
import { Pressable } from "react-native";
import { EDIT_HOME_CONTAINER_WIDTH } from "~/lib/home-animation-provider";
import { Badge } from "./ui/badge";
import { Text } from "./ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import Icons from "./ui/icons";
import { NAV_THEME } from "~/constants/Colors";
import { Link, useRouter } from "expo-router";
import { useAtom } from "jotai";
import { filterCountAtom } from "~/store/filters";

// raycast-home-search-transition-animation 🔽

const HeaderFilterButton: FC = () => {
  const { colorScheme } = useColorScheme();

  const router = useRouter();

  const [filterCount] = useAtom(filterCountAtom);

  console.log("HeaderFilterButton Rendered");

  return (
    <Pressable
      onPress={() => {
        console.log("Pressed");
        router.push("/(app)/(authenticated)/(user)/(modal)/filter");
      }}
      // on
      // onPress={simulatePress}
      className="items-center justify-center "
      style={{ width: EDIT_HOME_CONTAINER_WIDTH }}
    >
      <Badge
        variant={"secondary"}
        className="flex-row gap-x-1 h-9"
        pointerEvents="none"
      >
        <Icons.SolarTuningBoldDuotone
          width={19}
          height={19}
          color={NAV_THEME[colorScheme].muted}
        />
        <Text className="text-xs text-muted-foreground">{filterCount}</Text>
      </Badge>
    </Pressable>
  );
};

export default HeaderFilterButton;

// raycast-home-search-transition-animation 🔼
