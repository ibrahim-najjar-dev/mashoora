import { Image } from "expo-image";
import React, { memo, useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { withPause } from "react-native-redash";
import { ThemedText } from "../ThemedText";
import { ValueComponentProps } from "./filter-option";
import TimeFlow from "./timeflow";

const SIZE = 180;
const IMG_SIZE = 26;
const radius = SIZE / 2 - IMG_SIZE;

export const TimeValue: React.FC<ValueComponentProps> = ({ value = 0 }) => {
  const minutes = useSharedValue(0);

  useEffect(() => {
    runOnUI(() => {
      minutes.value = value;
    })();
  }, [value]);

  return <TimeFlow minutes={minutes} />;
};

TimeValue.displayName = "TimeValue";

export const FriendsAttendValue: React.FC<ValueComponentProps> = memo(
  ({ value = 0, working = false }) => {
    const rotation = useSharedValue(0);
    const paused = useSharedValue(!working);
    const COUNT = Math.min(12, value);

    useEffect(() => {
      runOnUI(() => {
        paused.value = !working;
      })();
    }, [working]);

    useEffect(() => {
      rotation.value = withPause(
        withRepeat(
          withTiming(360, { duration: 10000, easing: Easing.linear }),
          -1,
          false
        ),
        paused
      );
    }, []);

    const ringStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `-${rotation.value}deg` }],
    }));

    const imageStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <Animated.View
          style={[
            {
              width: SIZE,
              height: SIZE,
              position: "relative",
              marginRight: -SIZE / 2,
            },
            ringStyle,
          ]}
        >
          {Array.from({ length: COUNT }).map((_, i) => {
            const angle = (i * 360) / COUNT;
            const x = radius * Math.cos((angle * Math.PI) / 180);
            const y = radius * Math.sin((angle * Math.PI) / 180);

            return (
              <Animated.View
                key={i}
                style={[
                  {
                    position: "absolute",
                    left: SIZE / 2 + x - IMG_SIZE / 2,
                    top: SIZE / 2 + y - IMG_SIZE / 2,
                    backgroundColor: `hsl(${(i * 1200) / COUNT}, 80%, 80%)`,
                    borderRadius: 50,
                  },
                  imageStyle,
                ]}
              >
                <Image
                  style={{
                    width: IMG_SIZE,
                    height: IMG_SIZE,
                    borderRadius: IMG_SIZE / 2,
                  }}
                  source={{
                    uri: `https://api.dicebear.com/5.x/open-peeps/png?seed=${i}`,
                  }}
                />
              </Animated.View>
            );
          })}
        </Animated.View>
        <ThemedText
          style={{
            position: "absolute",
            left: SIZE / 3.2,
            textAlign: "center",
          }}
          type="subtitle"
        >
          {COUNT}
          <Text>{value > COUNT ? "+" : ""}</Text>
        </ThemedText>
      </View>
    );
  }
);

FriendsAttendValue.displayName = "FriendsAttendValue";
