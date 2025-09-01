import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

const stacksLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: true }} />
      <Stack.Screen
        name="switch-account"
        options={{
          headerShown: true,
          title: "Switch Account",
        }}
      />
      <Stack.Screen
        name="availability"
        options={{
          headerShown: true,
          title: "Set Your Availability",
        }}
      />
      <Stack.Screen
        name="langauge-selector"
        options={{ headerShown: true, title: "Language Selector" }}
      />
      {/* <Stack.Screen name="cupboard2" /> */}
    </Stack>
  );
};

export default stacksLayout;
