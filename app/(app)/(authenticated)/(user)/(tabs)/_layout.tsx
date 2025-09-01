import { Redirect, Tabs } from "expo-router";
import React, { useMemo } from "react";
import { Platform } from "react-native";

import { NAV_THEME } from "~/constants/Colors";
import {
  HomeAnimationProvider,
  useHomeAnimation,
} from "~/lib/home-animation-provider";
import { useColorScheme } from "~/lib/useColorScheme";

import { HapticTab } from "~/components/HapticTab";
import { TabBarBackground } from "~/components/tab-bar-background";
import Icons from "~/components/ui/icons";
import { useRTL } from "~/hooks/useRTL";
import { ANIMATED_TABS, type TabName } from "~/types/tab-animation";

// Inner component to handle route changes and animation state
const TabsContent = () => {
  const { colorScheme } = useColorScheme();
  const { isRTL } = useRTL();
  const { setCurrentTab } = useHomeAnimation();

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
        tabBarShowLabel: false,
        tabBarButton: HapticTab,
        // tabBarBackground: () => <TabBarBackground />,
        animation: "fade",
        tabBarStyle: [
          Platform.select({
            ios: {
              position: "absolute",
            },
          }),
          {
            // borderTopWidth: 1,
            backgroundColor: NAV_THEME[colorScheme].secondary,
            paddingTop: 12,
            paddingBottom: 4,
            direction: isRTL ? "rtl" : "ltr",
          },
        ],
      }}
      screenListeners={{
        state: (e) => {
          // Get the current route name
          const state = e.data.state;
          if (state) {
            const currentRouteName = state.routes[state.index]?.name as TabName;
            if (
              currentRouteName &&
              Object.keys(ANIMATED_TABS).includes(currentRouteName)
            ) {
              setCurrentTab(currentRouteName);
            }
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused, size }) =>
            focused ? (
              <Icons.SolarHomeAngle2Bold
                color={color}
                width={size}
                height={size}
              />
            ) : (
              <Icons.SolarHomeAngle2LineDuotone
                color={color}
                width={size}
                height={size}
              />
            ),
        }}
        listeners={{
          focus: () => setCurrentTab("index"),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, focused, size }) =>
            focused ? (
              <Icons.SolarLayersMinimalisticBoldDuotone
                color={color}
                width={size}
                height={size}
              />
            ) : (
              <Icons.SolarLayersMinimalisticLineDuotone
                color={color}
                width={size}
                height={size}
              />
            ),
        }}
        listeners={{
          focus: () => setCurrentTab("explore"),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          headerTitle: "My Bookings",
          tabBarIcon: ({ color, focused, size }) =>
            focused ? (
              <Icons.SolarClockCircleBold
                color={color}
                width={size}
                height={size}
              />
            ) : (
              <Icons.SolarClockCircleLineDuotone
                color={color}
                width={size}
                height={size}
              />
            ),
          headerShown: false,
          // headerSearchBarOptions: {},
        }}
        listeners={{
          focus: () => setCurrentTab("bookings"),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused, size }) =>
            focused ? (
              <Icons.SolarSettingsBoldDuotone
                color={color}
                width={size}
                height={size}
              />
            ) : (
              <Icons.SolarSettingsBoldDuotone
                color={color}
                width={size}
                height={size}
              />
            ),
          headerShown: false,
        }}
        listeners={{
          focus: () => setCurrentTab("chat"),
        }}
      />
    </Tabs>
  );
};

export default function TabLayout() {
  return (
    <HomeAnimationProvider>
      <TabsContent />
    </HomeAnimationProvider>
  );
}
