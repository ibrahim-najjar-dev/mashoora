import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { ChildProps } from "./filter-option";
// import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { CircleCheck } from "lucide-react-native";
import { MINUTES, minutesTo12HourFormat } from "~/constants";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import Clock from "./clock";

const isWeb = Platform.OS === "web";

const options = ["Single time", "Time range"];
const TIME_VIEW_HEIGHT = 36;
const VIEWABLE_LENGTH = 4.5;

export default function TimePicker({ handleChange, value }: ChildProps) {
  const scrollY = useSharedValue(Number(value));

  const derivedMinutes = useDerivedValue(() => {
    return Math.round(scrollY.value / 30) * 30;
  });

  useAnimatedReaction(
    () => derivedMinutes.value,
    (value) => runOnJS(handleChange)(value.toString())
  );

  return (
    <View className="flex-1 flex-row items-center justify-center">
      {/* <TimeSelectPane /> */}
      <View className="pt-0 items-center flex-row p-3 pb-4">
        <Clock timeInMinutes={derivedMinutes} />
        <TimeSelector scrollY={scrollY} />
      </View>
    </View>
  );
}

const TimeSelectPane = () => {
  const [selected, setSelected] = useState<number | null>(0);

  const handleSelect = (index: number) => {
    setSelected(index);
  };

  return (
    <View style={styles.pane}>
      {options.map((value, i) => (
        <Selector
          key={i}
          label={value}
          isSelected={selected === i}
          onSelect={() => handleSelect(i)}
        />
      ))}
    </View>
  );
};

type SelectorProps = {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
};

const Selector: React.FC<SelectorProps> = ({ label, onSelect, isSelected }) => {
  // const accent = useThemeColor({}, "accent");
  // const foreground = useThemeColor({}, "foreground");

  const { colorScheme } = useColorScheme();

  return (
    <View
      style={[
        styles.selectorCover,
        {
          borderColor: NAV_THEME[colorScheme].text,
        },
      ]}
    >
      <Pressable
        className="flex-row py-[7px] px-2 items-center"
        android_ripple={{
          color: "#ffffff04",
          borderless: true,
        }}
        onPress={onSelect}
      >
        {isSelected && (
          <CircleCheck color={NAV_THEME[colorScheme].primary} size={16} />
        )}

        <Text
          // type="subtitle"
          style={{
            fontSize: 14,
            pointerEvents: "none",
            paddingHorizontal: 5,
            opacity: 0.9,
          }}
          className="text-foreground"
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
};

const TimeSelector = ({ scrollY }: { scrollY: SharedValue<number> }) => {
  const scrollRef = useRef<Animated.ScrollView>(null);
  // const bgFade = useThemeColor({}, "backgroundFade");

  const { colorScheme } = useColorScheme();

  const isScrolling = useRef(false);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onMomentumEnd: (event) => {
      scrollY.value = Math.round(event.contentOffset.y / TIME_VIEW_HEIGHT) * 30;
      isScrolling.current = false;
    },
    onScroll: (event) => {
      if (isWeb) {
        if (!isScrolling.current) {
          isScrolling.current = true;
          scrollY.value = event.contentOffset.y;
        }

        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }

        timeoutId.current = setTimeout(() => {
          scrollY.value =
            Math.round(event.contentOffset.y / TIME_VIEW_HEIGHT) * 30;
        }, 50);
      }
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: (scrollY.value * TIME_VIEW_HEIGHT) / 30,
      animated: false,
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MaskedView
        maskElement={
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            colors={["transparent", "black", "black", "transparent"]}
            locations={[0.1, 0.4, 0.6, 0.9]}
            style={StyleSheet.absoluteFill}
          />
        }
      >
        <Animated.ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            paddingVertical:
              (TIME_VIEW_HEIGHT / 2) * (VIEWABLE_LENGTH - 5 / VIEWABLE_LENGTH),
            paddingHorizontal: 12,
          }}
          style={styles.timeSelector}
          showsVerticalScrollIndicator={false}
          snapToInterval={TIME_VIEW_HEIGHT}
          nestedScrollEnabled={true}
          decelerationRate="normal"
          onScroll={scrollHandler}
        >
          {MINUTES.map((minute, index) => (
            <TimeView key={index} item={minute.toString()} />
          ))}
        </Animated.ScrollView>
      </MaskedView>
    </View>
  );
};

const TimeView = ({ item }: { item: string }) => {
  return (
    <View
      style={{
        height: TIME_VIEW_HEIGHT,
        justifyContent: "center",
      }}
    >
      <Text className="text-center text-foreground font-Mono_Medium text-lg">
        {minutesTo12HourFormat(parseInt(item))}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pane: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  selectorCover: {
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 1,
  },

  timeSelector: {
    maxHeight: TIME_VIEW_HEIGHT * VIEWABLE_LENGTH,
  },
});
