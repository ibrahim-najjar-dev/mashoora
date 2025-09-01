import { BlurView } from "expo-blur";
import { useWindowDimensions } from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
} from "react-native-reanimated";
import { CarouselItem } from ".";
import { View } from "../ui/view";
import { Text } from "../ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface RenderItemProps {
  item: CarouselItem;
  index: number;
  scrollOffset: SharedValue<number>;
}

export const RenderItem: React.FC<RenderItemProps> = (props) => {
  const { item, index, scrollOffset } = props;
  const { width } = useWindowDimensions();
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const { colorScheme } = useColorScheme();

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollOffset.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    const translateX = interpolate(
      scrollOffset.value,
      inputRange,
      [-width * 0.75, 0, width * 0.75],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  const animatedProps = useAnimatedProps(() => {
    const intensity = interpolate(
      scrollOffset.value,
      inputRange,
      [100, 0, 100],
      Extrapolation.CLAMP
    );

    return {
      intensity,
    };
  });

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width,
        },
      ]}
      className={"items-center"}
    >
      <View
        className="h-20 rounded-xl justify-between dark:bg-neutral-900 bg-neutral-100 overflow-hidden"
        style={{ width: width * 0.95 }}
      >
        <AnimatedBlurView
          animatedProps={animatedProps}
          tint={colorScheme === "dark" ? "dark" : "light"}
          className={"absolute -inset-1 z-10"}
        />
        <View className="flex-1 flex-row justify-between items-center">
          <View className="ms-4 my-1 h-16 aspect-square justify-center items-center">
            {item.icon}
          </View>
          <View className="flex-1 justify-center ms-2 gap-1">
            <Text className="text-lg font-Geist_Medium text-foreground">
              {item.title}
            </Text>
            <Text className="text-sm font-Geist_Regular text-muted-foreground">
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
