import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)/stacks",
};

const stacksLayout = () => {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
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
      {/* <Stack.Screen name="cupboard2" /> */}
    </Stack>
  );
};

export default stacksLayout;
