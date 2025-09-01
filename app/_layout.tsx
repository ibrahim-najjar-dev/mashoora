import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "~/global.css";
import "~/i18n";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import "~/lib/polyfills";

import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexReactClient } from "convex/react";
import React, { useEffect } from "react";
import { Appearance, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { NAV_THEME } from "~/constants/Colors";
import { setAndroidNavigationBar } from "~/lib/android-navigation-bar";
import { useColorScheme } from "~/lib/useColorScheme";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Please set it in your .env file."
  );
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

const usePlatformSpecificSetup = Platform.select({
  web: useSetWebBackgroundClassName,
  android: useSetAndroidNavigationBar,
  default: noop,
});

const InititalLayout = () => {
  const [fontsLoaded] = useFonts({
    Mono_Regular: require("~/assets/fonts/mono/GeistMono-Regular.otf"),
    Mono_Medium: require("~/assets/fonts/mono/GeistMono-Medium.otf"),
    Mono_SemiBold: require("~/assets/fonts/mono/GeistMono-SemiBold.otf"),
    Mono_Bold: require("~/assets/fonts/mono/GeistMono-Bold.otf"),
    Geist_Regular: require("~/assets/fonts/geist/Geist-Regular.otf"),
    Geist_Medium: require("~/assets/fonts/geist/Geist-Medium.otf"),
    Geist_SemiBold: require("~/assets/fonts/geist/Geist-SemiBold.otf"),
    Geist_Bold: require("~/assets/fonts/geist/Geist-Bold.otf"),
    Cairo_Regular: require("~/assets/fonts/cairo/Cairo-Regular.ttf"),
    Cairo_Medium: require("~/assets/fonts/cairo/Cairo-Medium.ttf"),
    Cairo_SemiBold: require("~/assets/fonts/cairo/Cairo-SemiBold.ttf"),
    Cairo_Bold: require("~/assets/fonts/cairo/Cairo-Bold.ttf"),
    TwemojoMozilla: require("~/assets/fonts/Twemoji.Mozilla.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Hide the splash screen once the fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // Show a loading screen while the fonts are loading
    return null;
  }
  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {/* <PortalHost /> */}
    </View>
  );
};

export default function RootLayout() {
  const { isDarkColorScheme } = useColorScheme();
  usePlatformSpecificSetup();

  return (
    <>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <KeyboardProvider>
            <GestureHandlerRootView className="flex-1">
              <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <ThemeProvider
                  value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}
                >
                  <InititalLayout />
                  <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
                </ThemeProvider>
              </ConvexProviderWithClerk>
            </GestureHandlerRootView>
          </KeyboardProvider>
        </ClerkLoaded>
        <PortalHost />
      </ClerkProvider>
    </>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;

function useSetWebBackgroundClassName() {
  useIsomorphicLayoutEffect(() => {
    // Adds the background color to the html element to prevent white background on overscroll.
    document.documentElement.classList.add("bg-background");
  }, []);
}

function useSetAndroidNavigationBar() {
  React.useLayoutEffect(() => {
    setAndroidNavigationBar(Appearance.getColorScheme() ?? "light");
  }, []);
}

function noop() {}
