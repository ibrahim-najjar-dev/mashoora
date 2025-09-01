import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { SPRING_CONFIG } from "~/constants";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { Text } from "./text";
// import { useThemeColor } from "/hooks/useThemeColor";

type TimeFlowProps = {
  minutes: SharedValue<number>;
};

const DIGIT_HEIGHT = 24;
const TOTAL_DIGITS = 10;

const TimeFlowDigit: React.FC<{
  digit: SharedValue<number>;
  noPad?: boolean;
  delay?: number;
}> = ({ digit, noPad, delay = 0 }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withDelay(
            delay * 10,
            withSpring(
              interpolate(
                digit.value,
                [0, 9],
                [0, -9 * DIGIT_HEIGHT],
                Extrapolation.CLAMP
              ),
              SPRING_CONFIG
            )
          ),
        },
      ],
    };
  });

  return (
    <View style={styles.digitContainer}>
      <Animated.View style={animatedStyle}>
        {[...Array(TOTAL_DIGITS).keys()].map((num) => (
          <Text
            key={num}
            style={[styles.digitText]}
            className="font-Mono_Medium"
          >
            {num === 0 && noPad ? "" : num}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
};

const TimeFlowAmPm: React.FC<{
  isAM: SharedValue<boolean>;
}> = ({ isAM }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withSpring(isAM.value ? 0 : -DIGIT_HEIGHT, SPRING_CONFIG),
        },
      ],
    };
  });

  return (
    <View style={[styles.digitContainer, { paddingLeft: 3 }]}>
      <Animated.View style={animatedStyle}>
        <Text style={styles.digitText} className="font-Mono_Medium">
          am
        </Text>
        <Text style={styles.digitText} className="font-Mono_Medium">
          pm
        </Text>
      </Animated.View>
    </View>
  );
};

const extractDigit = (
  value: SharedValue<number>,
  divisor: number,
  place: number
) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useDerivedValue(() => {
    return Math.floor(((value.value / divisor) % 60) / place) % 10;
  });
};

const TimeFlow: React.FC<TimeFlowProps> = ({ minutes }) => {
  // const bg = useThemeColor({}, "foreground");
  const { colorScheme } = useColorScheme();
  const hoursTens = useDerivedValue(() => {
    const hour = Math.floor((minutes.value / 60) % 12) || 12;
    return Math.floor(hour / 10);
  });

  const hoursOnes = useDerivedValue(() => {
    const hour = Math.floor((minutes.value / 60) % 12) || 12;
    return hour % 10;
  });
  const minutesTens = extractDigit(minutes, 1, 10);
  const minutesOnes = extractDigit(minutes, 1, 1);
  const isAM = useDerivedValue(() => Math.floor(minutes.value / 60) % 24 < 12);

  return (
    <View style={styles.timeFlow}>
      <TimeFlowDigit digit={hoursTens} noPad />
      <TimeFlowDigit digit={hoursOnes} delay={1} />
      <Text style={[styles.separator]} className="font-Mono_Medium">
        :
      </Text>
      <TimeFlowDigit digit={minutesTens} delay={2} />
      <TimeFlowDigit digit={minutesOnes} delay={3} />
      <TimeFlowAmPm isAM={isAM} />
      <LinearGradient
        colors={[
          NAV_THEME[colorScheme].secondary,
          "transparent",
          "transparent",
          "transparent",
          NAV_THEME[colorScheme].secondary,
        ]}
        style={styles.overlay}
      />
    </View>
  );
};

export default TimeFlow;

const styles = StyleSheet.create({
  timeFlow: {
    flexDirection: "row",
    alignItems: "center",
  },
  digitContainer: { height: DIGIT_HEIGHT, overflow: "hidden" },
  digitText: {
    textAlign: "center",
    lineHeight: DIGIT_HEIGHT,
    height: DIGIT_HEIGHT,
  },
  separator: {
    lineHeight: DIGIT_HEIGHT,
  },
  overlay: {
    height: DIGIT_HEIGHT + 2,
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
});
