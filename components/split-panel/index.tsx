import React from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import Spilt1 from "~/components/split-panel/split1";
import Spilt2 from "~/components/split-panel/split2";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { Button } from "../ui/button";
// import {
//   AcceptCallButton,
//   CallControls,
//   HangUpCallButton,
//   ReactionsButton,
//   ToggleAudioPreviewButton,
// } from "@stream-io/video-react-native-sdk";
import HangupButton from "../video/hangup-button";
import ToggleAudioButton from "../video/toggle-audio-button";

const CONTROL_BAR_HEIGHT = 50;

export default function SpiltPanKit() {
  const { height } = Dimensions.get("screen");
  const [currentIndex, setCurrentIndex] = React.useState(1);
  const positions = [height * 0.2, height * 0.4, height * 0.65];
  const translateY = useSharedValue(positions[1]);
  const startY = useSharedValue(translateY.value);

  const { colorScheme } = useColorScheme();

  const router = useRouter();

  const gesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      const raw = startY.value + event.translationY;

      const min = positions[0];
      const max = positions[2];

      if (raw < min) {
        translateY.value = min - Math.pow(min - raw, 0.7);
      } else if (raw > max) {
        translateY.value = max + Math.pow(raw - max, 0.7);
      } else {
        translateY.value = raw;
      }
    })
    .onEnd(() => {
      const closest = positions.reduce((prev, curr) =>
        Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value)
          ? curr
          : prev
      );

      translateY.value = withSpring(closest, {
        damping: 20,
        stiffness: 150,
      });
    });

  const topStyle = useAnimatedStyle(() => ({
    height: translateY.value,
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const bottomStyle = useAnimatedStyle(() => ({
    top: translateY.value + CONTROL_BAR_HEIGHT,
    bottom: 0,
  }));
  useAnimatedReaction(
    () => translateY.value,
    (value) => {
      const closest = positions.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      const index = positions.indexOf(closest);
      runOnJS(setCurrentIndex)(index);
    },
    [positions]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <GestureDetector gesture={gesture}>
        <View style={{ flex: 1 }}>
          <Animated.View
            style={[{ width: "100%", position: "absolute" }, topStyle]}
          >
            <Spilt1
              onPressPosition={(index) => {
                translateY.value = withSpring(positions[index], {
                  damping: 20,
                });
              }}
            />
          </Animated.View>

          <Animated.View
            style={[
              dividerStyle,
              {
                position: "absolute",
                width: "100%",
                height: CONTROL_BAR_HEIGHT,
                zIndex: 10,
                alignItems: "center",
                justifyContent: "center",
              },
            ]}
            className={"flex-row gap-x-2 "}
          >
            <View className="flex-1 flex-row gap-x-1.5 px-2">
              {/* <HangupButton />
              <ToggleAudioButton /> */}
            </View>

            <View
              style={{
                width: 60,
                height: 7,
                backgroundColor: NAV_THEME[colorScheme].border,
                borderRadius: 9999,
              }}
            />
            <View className="flex-1"></View>
          </Animated.View>

          <Animated.View
            style={[
              {
                position: "absolute",
                width: "100%",
              },
              bottomStyle,
            ]}
          >
            <Spilt2
              translateY={translateY}
              positions={positions}
              currentIndex={currentIndex}
              onPressPosition={(index) => {
                translateY.value = withSpring(positions[index], {
                  damping: 20,
                });
              }}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}
