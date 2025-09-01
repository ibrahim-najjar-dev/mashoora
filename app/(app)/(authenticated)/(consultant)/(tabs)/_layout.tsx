import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "~/components/HapticTab";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";

import { BlurView } from "expo-blur";
import { House } from "lucide-react-native";
import { Button } from "~/components/ui/button";
import Icons from "~/components/ui/icons";
import { useRTL } from "~/hooks/useRTL";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  const { isRTL } = useRTL();

  console.log(`TABS USER`);

  return (
    <Tabs
      key={isRTL ? "rtl" : "ltr"} // <- Force remount when direction changes
      screenOptions={{
        tabBarActiveTintColor: NAV_THEME[colorScheme].primary,
        headerTitleStyle: {
          fontFamily: "Geist_Bold",
        },
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarBackground: () => (
          <BlurView
            intensity={80}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        ),
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            transform: isRTL ? [{ scaleX: -1 }] : undefined, // ← RTL handling
          },
          default: {
            transform: isRTL ? [{ scaleX: -1 }] : undefined,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // title: "Home",
          tabBarIcon: ({ color }) => <House size={28} color={color} />,
          headerShown: true,
          // no header title
          headerTitle: "",
          // make header transparent
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerRight: () => (
            <Button size={"icon"} className="mr-5 h-9 w-9" variant={"ghost"}>
              <Icons.SolarInboxBoldDuotone
                height={24}
                width={24}
                color={NAV_THEME[colorScheme].muted}
              />
            </Button>
          ),
        }}
      />
    </Tabs>
  );
}
