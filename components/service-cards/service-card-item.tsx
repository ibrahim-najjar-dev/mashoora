import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Badge } from "../ui/badge";
import Icons from "../ui/icons";
import { Text } from "../ui/text";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Doc } from "~/convex/_generated/dataModel";
import { EnhancedService } from "~/types/enhanced-services";
import { View } from "../ui/view";
import { useTranslation } from "react-i18next";
import { Pressable } from "../ui/pressable";

// showcase-upcoming-list-scroll-animation 🔽

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Fixed item height for consistent scroll calculations
export const ITEM_HEIGHT = 170;
// iOS large title compensation - accounts for nav header behavior
const LARGE_TITLE_SCROLL_DISTANCE = 100;

export const UpcomingItem = ({
  index,
  scrollY,
  itemY,
  item,
}: {
  item: EnhancedService;
  index: any;
  scrollY: any;
  itemY?: any; // Make itemY optional since it's injected by CustomCellRendererComponent
}) => {
  const router = useRouter();

  const { i18n } = useTranslation();

  const { t } = useTranslation();

  // Main animation style - handles both translation and scaling during scroll
  const rContainerStyle = useAnimatedStyle(() => {
    // Only animate if itemY is available
    if (!itemY) {
      return {};
    }

    return {
      transform: [
        {
          // Subtle upward translation effect when item approaches viewport top
          translateY: interpolate(
            scrollY.value,
            [
              itemY.value - index - 1 - LARGE_TITLE_SCROLL_DISTANCE, // Before animation zone
              itemY.value - index - LARGE_TITLE_SCROLL_DISTANCE, // Animation start point
              itemY.value - index + 1 - LARGE_TITLE_SCROLL_DISTANCE, // Animation end point
            ],
            [0, 0, 1] // No translation → No translation → 1px down
          ),
        },
        {
          // Scale down effect as item scrolls past viewport (0.9x when fully scrolled)
          scale: interpolate(
            scrollY.value,
            [
              itemY.value - 1 - LARGE_TITLE_SCROLL_DISTANCE, // Before animation zone
              itemY.value - LARGE_TITLE_SCROLL_DISTANCE, // Animation start point
              itemY.value + ITEM_HEIGHT - LARGE_TITLE_SCROLL_DISTANCE, // Animation end point
            ],
            [1, 1, 0.9] // No scale → No scale → 0.9x scale
          ),
        },
      ],
    };
  });

  // iOS-only blur effect that increases as item scrolls away
  const backdropAnimatedProps = useAnimatedProps(() => {
    // Only animate if itemY is available
    if (!itemY) {
      return { intensity: 0 };
    }

    // Blur intensity increases from 0 to 15 as item exits viewport
    const intensity = interpolate(
      scrollY.value,
      [
        itemY.value - 1 - LARGE_TITLE_SCROLL_DISTANCE, // Before animation zone
        itemY.value - LARGE_TITLE_SCROLL_DISTANCE, // Animation start point
        itemY.value + ITEM_HEIGHT - LARGE_TITLE_SCROLL_DISTANCE, // Animation end point
      ],
      [0, 0, 15] // No blur → No blur → 15 blur
    );

    return {
      intensity,
    };
  });

  console.log(item.consultantProfile);
  console.log(item.consultant.firstName);
  console.log(item.category);

  return (
    <Animated.View
      className="w-full items-center px-4 py-[5px] overflow-hidden"
      style={[rContainerStyle, styles.container]}
    >
      <Link
        href={`/(app)/(authenticated)/(user)/(modal)/service/${item._id}`}
        asChild
      >
        <Pressable className="flex-1 p-2 flex-row gap-2 bg-secondary rounded-3xl border border-neutral-700/15">
          <View className="py-2 px-2 gap-3 items-centter justify-between">
            <Avatar alt={""} className="w-10 h-10 bg-neutral-800">
              {/* <AvatarImage
                source={{
                  uri: item.consultant.imageUrl,
                }}
              /> */}
              <AvatarFallback>
                <Text className="text-muted-foreground font-Mono_Bold">
                  {item.consultant.firstName?.charAt(0)}
                  {item.consultant.lastName?.charAt(0)}
                </Text>
              </AvatarFallback>
            </Avatar>
            {/* <View className="w-10 h-10 bg-rose-500 rounded-xl items-center justify-center">
              <Icons.SolarUserCircleBoldDuotone
                height={24}
                width={24}
                color="#fff"
              />
            </View> */}
            <View className="flex-col items-center gap-1">
              <Icons.SolarStarBold height={20} width={20} color="#fbbf24" />
              <Text className="text-xs text-center font-Mono_SemiBold">
                {item.reviewStats?.averageRating || 0}
              </Text>
            </View>
            {/* <View className="w-8 h-3 rounded-full bg-neutral-700" /> */}
          </View>
          <View
            className="flex-1 bg-neutral-900/50 rounded-2xl px-3 py-2 items-stretch"
            style={styles.imageContainer}
          >
            <View className="flex-1">
              <View>
                <Text className="text-lg font-Geist_Medium">
                  {i18n.language === "ar" && item.name_ar
                    ? item.name_ar
                    : item.name}
                </Text>
              </View>
              <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                <Badge
                  variant={"outline"}
                  className="flex-row items-center px-1.5 rounded-md py-1"
                >
                  <View className="flex-row gap-x-1.5 items-center">
                    <View
                      style={{
                        height: 14,
                        width: 14,
                        borderRadius: 4,
                      }}
                      className="items-center justify-center bg-rose-500"
                    >
                      <Icons.SolarHeartPulseBoldDuotone
                        height={12}
                        width={12}
                        color="#fff"
                      />
                    </View>
                    <Text className="text-xs">
                      {i18n.language === "ar" && item.category?.name_ar
                        ? item.category?.name_ar
                        : item.category?.name}
                    </Text>
                  </View>
                </Badge>
                <Badge
                  variant={"outline"}
                  className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                >
                  <View className="flex-row gap-x-1.5 items-center">
                    <Icons.SolarVideocameraRecordBold
                      height={12}
                      width={12}
                      color="#f43f5e"
                    />

                    <Text className="text-xs">
                      {t("time.minutes", { value: item.duration })}
                    </Text>
                  </View>
                </Badge>
                <Badge
                  variant={"outline"}
                  className="flex-row items-center px-1.5 rounded-md py-1"
                >
                  <View className="flex-row gap-x-1.5 items-center">
                    <Icons.SolarMedalRibbonsStarBoldDuotone
                      height={12}
                      width={12}
                      color="#fff"
                    />
                    <Text className="text-xs">
                      {t("time.years", {
                        value: item.consultantProfile?.yearsOfExperience || 0,
                      })}
                    </Text>
                  </View>
                </Badge>
                <Badge
                  variant={"outline"}
                  className="flex-row items-center px-1.5 rounded-md py-1"
                >
                  <View className="flex-row gap-x-1.5 items-center">
                    <Icons.SolarUserSpeakRoundedBoldDuotone
                      height={12}
                      width={12}
                      color="#fff"
                    />

                    <Text className="text-xs">
                      {item.consultantProfile?.spokenLanguages?.join(", ")}
                    </Text>
                  </View>
                </Badge>
              </View>
            </View>
            <View className="flex-row justify-between items-end">
              <View className="flex-1">
                {/* nearest available appointment */}
                <View>
                  <Text className="text-xs text-muted-foreground font-Geist_Regular">
                    Available Today
                  </Text>
                </View>
              </View>
              {/* price */}
              <View className="flex-row items-center gap-x-1.5">
                <Image
                  source={require("~/assets/images/sar_symbol.svg")}
                  style={{ width: 16, height: 16, tintColor: "white" }}
                />
                <Text className="font-Mono_SemiBold text-base">
                  {item.price}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Link>
      {/* iOS-only: Dark blur overlay for depth effect during scroll */}
      {/* {Platform.OS === "ios" && (
        <AnimatedBlurView
          // className={}
          pointerEvents={"none"}
          style={StyleSheet.absoluteFill}
          tint="dark"
          animatedProps={backdropAnimatedProps}
        />
      )} */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    borderCurve: "continuous",
  },
  imageContainer: {
    borderCurve: "continuous",
  },
});

// showcase-upcoming-list-scroll-animation 🔼
