import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import { useHomeAnimation } from "~/lib/home-animation-provider";
import { useColorScheme } from "~/lib/useColorScheme";

// raycast-home-search-transition-animation 🔽

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const AnimatedBlur = () => {
  const { blurIntensity } = useHomeAnimation();

  const { colorScheme } = useColorScheme();

  const backdropAnimatedProps = useAnimatedProps(() => {
    return {
      intensity: blurIntensity.value,
    };
  });

  return (
    <AnimatedBlurView
      tint={colorScheme === "dark" ? "dark" : "light"}
      style={[StyleSheet.absoluteFill, styles.container]}
      animatedProps={backdropAnimatedProps}
      experimentalBlurMethod="dimezisBlurView"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    pointerEvents: "none",
  },
});

// raycast-home-search-transition-animation 🔼
