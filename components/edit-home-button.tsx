import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Settings2 } from "lucide-react-native";
import React, { FC } from "react";
import { Pressable } from "react-native";
import { EDIT_HOME_CONTAINER_WIDTH } from "~/lib/home-animation-provider";
import { useColorScheme } from "~/lib/useColorScheme";

// raycast-home-search-transition-animation 🔽

export const EditHomeButton: FC = () => {
  const router = useRouter();

  const { colorScheme } = useColorScheme();

  return (
    <Pressable
      onPress={() => router.push("/(app)/(authenticated)/(user)/(modal)/about")}
      className="items-center justify-center"
      style={{ width: EDIT_HOME_CONTAINER_WIDTH }}
    >
      {/* <Settings2 size={24} color="#e5e5e5" /> */}
      <Image
        // source={require(
        //   colorScheme === "dark"
        //     ? "~/assets/icons/splash-icon-dark.png"
        //     : "~/assets/icons/splash-icon-light.png"
        // )}
        source={
          colorScheme === "dark"
            ? require("~/assets/icons/splash-icon-light.png")
            : require("~/assets/icons/splash-icon-dark.png")
        }
        style={{
          width: EDIT_HOME_CONTAINER_WIDTH - 30,
          height: EDIT_HOME_CONTAINER_WIDTH - 30,
        }}
        className="mbt-4"
      />
    </Pressable>
  );
};

// raycast-home-search-transition-animation 🔼
