import { ScanText } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  FadeInUp,
  FadeOut,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
// import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import Icons from "../ui/icons";
// import { useCallStateHooks } from "@stream-io/video-react-native-sdk";
import Tab1 from "./tab1";

type Props = {
  translateY: Animated.SharedValue<number>;
  positions: number[];
  currentIndex: number;
  onPressPosition: (index: 0 | 1 | 2) => void;
};

const SecondRoute = () => (
  <View className="flex-1 items-center justify-center">
    <Text className="text-lg font-bold">Second Tab</Text>
  </View>
);

const ThirdRoute = () => (
  <View className="flex-1 items-center justify-center">
    <Text className="text-lg font-bold">Third Tab</Text>
  </View>
);

const FirstRoute = ({
  translateY,
  positions,
  currentIndex,
  onPressPosition,
}: Props) => {
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  const scale = useSharedValue(1);

  const animatedBoxStyle = useAnimatedStyle(() => {
    const size = interpolate(
      translateY.value,
      [positions[0], positions[1], positions[2]],
      [180, 120, 80]
    );
    const color = interpolateColor(
      translateY.value,
      [positions[0], positions[1], positions[2]],
      ["#3d56e5", "#f3b606", "#c70404"]
    );

    return {
      height: size,
      width: size,
      backgroundColor: color,
    };
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1">
      {currentIndex === 0 && (
        <AnimatedPressable
          onPressIn={() => {
            scale.value = withTiming(0.9, { duration: 100 });
          }}
          onPressOut={() => {
            scale.value = withTiming(1, { duration: 100 });
          }}
          onPress={() => onPressPosition(1)}
          entering={FadeInUp}
          exiting={FadeOut}
          style={[
            {
              marginTop: 16,
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            },
            animatedStyle,
          ]}
        >
          <Text className="px-4 py-1.5 bg-border rounded-full font-bold text-foreground">
            Close
          </Text>
        </AnimatedPressable>
      )}
      <View className="flex-1 justify-center items-center">
        <Animated.View
          style={[
            {
              borderRadius: 12,
            },
            animatedBoxStyle,
          ]}
        />
      </View>
    </View>
  );
};

export default function Split2({
  translateY,
  positions,
  currentIndex,
  onPressPosition,
}: Props) {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  const { colorScheme } = useColorScheme();

  const [routes] = React.useState([
    {
      key: "first",
      title: "General",
      icon: <ScanText size={20} color={"white"} />,
    },
    {
      key: "second",
      title: "Transcript",
      icon: <ScanText size={20} color="#f3b606" />,
    },
    {
      key: "third",
      title: "AI notes",
      icon: <ScanText size={20} color="#c70404" />,
    },
  ]);

  // const renderScene = SceneMap({
  //   first: Tab1,
  //   second: SecondRoute,
  //   third: ThirdRoute,
  // });
  const renderTabBar = (props: any) => {
    // return (
    //   <TabBar
    //     {...props}
    //     className="bg-secondary"
    //     indicatorStyle={{ backgroundColor: NAV_THEME[colorScheme].primary }}
    //     style={{
    //       backgroundColor: NAV_THEME[colorScheme].background,
    //       borderTopLeftRadius: 16,
    //       borderTopRightRadius: 16,
    //     }}
    //     labelStyle={{ color: NAV_THEME[colorScheme].text, fontWeight: "600" }}
    //     activeColor={NAV_THEME[colorScheme].primary}
    //     inactiveColor={NAV_THEME[colorScheme].border}
    //   />
    // );
    return <></>;
  };

  return (
    <View className="flex-1 bg-background rounded-t-2xl">
      {/* <TabView
        commonOptions={{
          icon: ({ route, focused, color, size }) => (
            <Icons.SolarClapperboardTextBoldDuotone
              height={size}
              width={size}
              color={color}
            />
          ),
        }}
        // make icons and label flex row
        style={{}}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      /> */}
    </View>
  );
}
