import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { KeyboardToolbar } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
// import { KeyboardToolbar } from "react-native-keyboard-controller";
import { AnimatedHeaderSystem } from "~/components/animated-header-system";
import { Favorites } from "~/components/favorites";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Textarea } from "~/components/ui/textarea";
import { View } from "~/components/ui/view";
import { NAV_THEME } from "~/constants/Colors";
import { useAndroidNote } from "~/hooks/use-android-note";
import { useGradualAnimation } from "~/hooks/use-gradual-animation";
import { useColorScheme } from "~/lib/useColorScheme";
import { generateAPIUrl } from "~/lib/utils";

export default function TabTwoScreen() {
  useAndroidNote(
    "Android doesn't support scroll in negative direction, so the animation is limited. Blur is still experimental on Android; to avoid performance issues, use a solid background color instead of blur."
  );

  const { t } = useTranslation();

  const bottomTabBarHeight = useBottomTabBarHeight();

  const [input, setInput] = useState("");

  const router = useRouter();

  const { colorScheme } = useColorScheme();

  const { height } = useGradualAnimation();
  const inputRef = useRef<TextInput>(null);

  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: Math.max(height.value + 40, bottomTabBarHeight),
    };
  }, [bottomTabBarHeight]);

  return (
    <>
      <AnimatedHeaderSystem tabName="index">
        <Favorites />

        <View className="justify-end absolute bottom-0 right-0 left-0">
          {/* TEXT AREA */}
          <View
            className="h-[90px] rounded-2xl mb-5 mx-3 relative overflow-hidden"
            style={{
              backgroundColor: "transparent",
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <BlurView
              intensity={80}
              tint={colorScheme === "dark" ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
              className="rounded-2xl"
            />
            <View className="flex-row px-3 h-full">
              <Textarea
                value={input}
                onChangeText={setInput}
                className="font-Geist_Regular bg-transparent border-none border-transparent p-0 placeholder:text-neutral-400 min-h-fit py-3 flex-1"
                placeholder="Ask me anything..."
                // maxLength={200}
                lineBreakModeIOS="tail"
                ref={inputRef as any}
              />
            </View>
            <View className="flex-row items-center justify-between py-2.5 absolute bottom-0 right-0 left-0 px-2.5">
              <View />
              <LinearGradient
                // Button Linear Gradient
                colors={["#6DB17B", "#335F3C"]}
                locations={[0, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  alignItems: "center",
                  borderRadius: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <Text className="text-foreground font-Geist_SemiBold text-lg">
                  Ask Ai
                </Text>
              </LinearGradient>
            </View>
          </View>
          <Animated.View style={keyboardPadding} className="" />
        </View>
      </AnimatedHeaderSystem>
      <KeyboardToolbar
        // content={<Text className="text-foreground">This is a toolbar</Text>}
        showArrows={false}
        theme={{
          dark: {
            background: NAV_THEME.dark.secondary,
            ripple: NAV_THEME.dark.text,
            primary: NAV_THEME.dark.primary,
            disabled: NAV_THEME.dark.muted,
          },
          light: {
            background: NAV_THEME.light.background,
            ripple: NAV_THEME.light.text,
            primary: NAV_THEME.light.primary,
            disabled: NAV_THEME.light.muted,
          },
        }}
        insets={{ left: 16, right: 0 }}
        doneText="Close keyboard"
      />
    </>
  );
}
