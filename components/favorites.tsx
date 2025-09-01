import MaskedView from "@react-native-masked-view/masked-view";
import { useQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { LinearGradient } from "expo-linear-gradient";
import React, { FC } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "~/convex/_generated/api";
import { useHapticOnScroll } from "~/hooks/use-haptic-on-scroll";
import { useScrollDirection } from "~/hooks/use-scroll-direction";
import {
  FULL_DRAG_DISTANCE,
  TRIGGER_DRAG_DISTANCE,
  useHomeAnimation,
} from "~/lib/home-animation-provider";
import { useHeaderHeight } from "~/lib/use-header-height";
import { cn } from "~/lib/utils";
import { TopGradient } from "./top-gradient";
import Icons from "./ui/icons";
import { Text } from "./ui/text";
import CardsCarousel from "./carousel";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { Link } from "./ui/form";
import * as ContextMenu from "zeego/context-menu";
import { Image } from "expo-image";
import AppleWidget from "./apple-widget";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { View } from "./ui/view";
import { FlatList } from "./ui/flatlist";
import { useTranslation } from "react-i18next";

// raycast-home-search-transition-animation 🔽

const FavoriteItem: FC<
  FunctionReturnType<typeof api.categories.getCategories>[0]
> = ({ name, iconName, iconClassName, _id, name_ar }) => {
  // console.log("FavoriteItem", { name, iconName, iconClassName, _id });

  const { i18n } = useTranslation();

  return (
    <View className="flex-1 gap-3 items-center justify-center">
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <View
            className={cn(
              "w-14 h-14 rounded-2xl justify-center items-center bg-rose-500",
              iconClassName
            )}
            style={styles.borderCurve}
          >
            {/* {icon ? (
          icon
        ) : (
          <Icons.SolarHelpBoldDuotoner
            height={24}
            width={24}
            className="text-white"
          />
        )} */}
            {iconName ? (
              React.createElement((Icons as any)[iconName], {
                height: 24,
                width: 24,
                color: "#fff",
              })
            ) : (
              <Icons.SolarHelpBoldDuotone
                height={24}
                width={24}
                className="text-white"
              />
            )}
          </View>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          {/* <ContextMenu.Preview>{() => <Preview />}</ContextMenu.Preview> */}
          <ContextMenu.Label />
          <ContextMenu.Item
            key="item-1"
            onSelect={() => console.log("item-1 selected")}
          >
            <ContextMenu.ItemTitle>Item Title</ContextMenu.ItemTitle>
          </ContextMenu.Item>

          <ContextMenu.Separator />
          <ContextMenu.Arrow />
        </ContextMenu.Content>
      </ContextMenu.Root>
      {name ? (
        <Text className="text-center text-xs line-clamp-1 font-Geist_Bold">
          {i18n.language === "ar" && name_ar ? name_ar : name}
        </Text>
      ) : (
        <View className={cn("h-4 w-5 rounded-full bg-neutral-200/10")} />
      )}
    </View>
  );
};

// FlatList configuration constants
const ITEM_WIDTH = 70;
const ITEM_SPACING = 16;
const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = (SCREEN_WIDTH - ITEM_WIDTH) / 2; // Center first/last items
const ITEM_TOTAL_WIDTH = ITEM_WIDTH + ITEM_SPACING; // Total width including separator

export const Favorites = () => {
  const categories = useQuery(api.categories.getCategories);

  // console.log("categories", categories);
  // console.log("categories length", categories?.length);

  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  const { t } = useTranslation();

  const insets = useSafeAreaInsets();
  const { grossHeight } = useHeaderHeight();

  const { screenView, offsetY, isListDragging, blurIntensity, onGoToCommands } =
    useHomeAnimation();

  const { colorScheme } = useColorScheme();

  const { onScroll: scrollDirectionOnScroll, scrollDirection } =
    useScrollDirection("include-negative");

  const { singleHapticOnScroll } = useHapticOnScroll({
    isListDragging,
    scrollDirection,
    triggerOffset: TRIGGER_DRAG_DISTANCE,
  });

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      isListDragging.value = true;
    },
    onScroll: (event) => {
      const offsetYValue = event.contentOffset.y;

      offsetY.value = offsetYValue;

      if (screenView.value === "favorites") {
        blurIntensity.value = interpolate(
          offsetYValue,
          [0, FULL_DRAG_DISTANCE],
          [0, 100],
          Extrapolation.CLAMP
        );
      }

      scrollDirectionOnScroll(event);
      singleHapticOnScroll(event);
    },
    onEndDrag: (event) => {
      isListDragging.value = false;
      const scrollY = event.contentOffset.y;
      if (scrollY < TRIGGER_DRAG_DISTANCE) {
        runOnJS(onGoToCommands)();
      }
    },
  });

  const rContainerStyle = useAnimatedStyle(() => {
    return {
      pointerEvents: screenView.value === "commands" ? "none" : "auto",
    };
  });

  const rTopGradientStyle = useAnimatedStyle(() => {
    return {
      opacity:
        offsetY.value < 0
          ? 0
          : screenView.value === "favorites"
            ? withTiming(1)
            : 0,
    };
  });

  // Don't render until we have data
  if (!categories) {
    return null;
  }

  return (
    <View className="flex-1" style={rContainerStyle}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        className=""
        style={{
          paddingBottom: insets.bottom + 8,
          paddingTop: grossHeight + 30,
        }}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
      >
        <MaskedView
          maskElement={
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={["transparent", "black", "black", "transparent"]}
              locations={[0, 0.15, 0.85, 1]}
              style={StyleSheet.absoluteFill}
            />
          }
          style={{ marginBottom: 8 }}
        >
          <FlatList
            data={categories}
            keyExtractor={(item) => `favorite-item-${item._id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 20,
              paddingHorizontal: HORIZONTAL_PADDING, // Add padding to center first/last items
            }}
            renderItem={({ item, index }) => (
              <View
                style={{ width: ITEM_WIDTH, alignItems: "center" }}
                // className="flex-row"
              >
                <FavoriteItem
                  _id={item._id}
                  _creationTime={item._creationTime}
                  iconClassName={item.iconClassName}
                  name_ar={item.name_ar}
                  name={item.name}
                  iconName={item.iconName}
                />
              </View>
            )}
            ItemSeparatorComponent={() => (
              <View style={{ width: ITEM_SPACING }} />
            )}
            contentInsetAdjustmentBehavior="automatic"
            // className="flex-1 bg-red-400"
            contentContainerClassName=""
            initialNumToRender={categories.length}
            snapToInterval={ITEM_TOTAL_WIDTH} // Total width including separator
            snapToAlignment="start"
            decelerationRate="fast"
            pagingEnabled={false}
            getItemLayout={(data, index) => ({
              length: ITEM_TOTAL_WIDTH, // item width + separator
              offset: ITEM_TOTAL_WIDTH * index,
              index,
            })}
            initialScrollIndex={Math.floor(categories.length / 2)} // Start from middle item
            onScrollToIndexFailed={() => {}} // Handle potential scroll failures
          />
        </MaskedView>
        <View className="">
          <CardsCarousel
            data={[
              {
                id: 1,
                title: "Connect your calendar app",
                description: "get notified about consultation appointments",
                icon: (
                  <Image
                    source={{
                      uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Apple_Calendar_%28iOS%29.svg/1024px-Apple_Calendar_%28iOS%29.svg.png",
                    }}
                    style={{
                      width: 44,
                      height: 44,
                    }}
                  />
                ),
              },
              {
                id: 2,
                title: "Become a Consultant",
                description: "Offer your expertise and get paid!",
                icon: (
                  <Image
                    source={require("~/assets/icons/adaptive-icon.png")}
                    style={{
                      width: 100,
                      height: 100,
                    }}
                  />
                ),
              },
            ]}
          />
        </View>
        <View className="mt-4 flex-col">
          {/* todo */}
          <View className="px-4 py-2 flex-row items-center gap-x-2">
            <Icons.SolarClockCircleBold
              height={24}
              width={24}
              color={NAV_THEME[colorScheme].primary}
            />
            <Text className="text-lg font-Geist_Medium">
              {t("home.upcoming-bookings")}
            </Text>
          </View>
          <FlatList
            className="px-4 gap-4 flex-1"
            ListEmptyComponent={
              <View
                className="flex-1 h-20 items-center justify-center gap-y-2"
                style={{
                  width: SCREEN_WIDTH,
                }}
              >
                <Text className="text-muted-foreground">
                  {t("home.empty-bookings")}
                </Text>
              </View>
            }
            data={[]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                className="h-20 dark:bg-neutral-900 bg-neutral-100 rounded-xl flex-row items-center px-3 gap-x-3 mr-4"
                style={{}}
              >
                {/* image */}
                <Avatar
                  alt={item.title}
                  className="w-16 h-16 bg-white flex items-center justify-center"
                >
                  <AvatarImage
                    source={item.image as any}
                    style={{
                      width: 60,
                      height: 60,
                    }}
                  />
                  <AvatarFallback></AvatarFallback>
                </Avatar>
                {/* Content title and description */}
                <View className="flex-1">
                  <Text className="text-foreground font-Geist_Medium text-lg">
                    {item.title}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                    <Badge
                      variant={"outline"}
                      className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                    >
                      <Icons.SolarMedalRibbonsStarBoldDuotone
                        height={12}
                        width={12}
                        color={NAV_THEME[colorScheme].primary}
                      />

                      <Text className="text-xs">+5 years</Text>
                    </Badge>
                    <Badge
                      variant={"outline"}
                      className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                    >
                      <Icons.SolarStarsBoldDuotone
                        height={12}
                        width={12}
                        color="#E4CC77"
                      />

                      <Text className="text-xs">5</Text>
                    </Badge>
                    <Badge
                      variant={"outline"}
                      className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                    >
                      <Text className="text-xs">+4</Text>
                    </Badge>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
        <View className="mt-4">
          {/* todo */}
          <View className="px-4 py-2 flex-row items-center gap-x-2">
            <Icons.SolarFlameBold height={24} width={24} color={"#E4CC77"} />
            <Text className="text-lg font-Geist_Medium">
              {t("home.popular-consultants")}
            </Text>
          </View>
          <FlatList
            className="px-4 gap-4 flex-1"
            data={[
              {
                id: "1",
                title: "Emaar Real Estate",
                description: "description",
                image: require("~/assets/icons/emaar.png"),
              },
              {
                id: "2",
                title: "Dubai Health",
                description: "description",
                image: {
                  uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoL9zTi-XI-7ziBqxDGGvO_7-w7EomchPgJw&s",
                },
              },
            ]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                className="h-20 bg-neutral-900 rounded-xl flex-row items-center px-3 gap-x-3 mr-4"
                style={{}}
              >
                {/* image */}
                <Avatar
                  alt={item.title}
                  className="w-16 h-16 bg-white flex items-center justify-center"
                >
                  <AvatarImage
                    source={item.image}
                    style={{
                      width: 60,
                      height: 60,
                    }}
                  />
                  <AvatarFallback></AvatarFallback>
                </Avatar>
                {/* Content title and description */}
                <View className="flex-1">
                  <Text className="text-foreground font-Geist_Medium text-lg">
                    {item.title}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                    <Badge
                      variant={"outline"}
                      className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                    >
                      <Icons.SolarMedalRibbonsStarBoldDuotone
                        height={12}
                        width={12}
                        color={NAV_THEME[colorScheme].primary}
                      />

                      <Text className="text-xs">+5 years</Text>
                    </Badge>
                    <Badge
                      variant={"outline"}
                      className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                    >
                      <Icons.SolarStarsBoldDuotone
                        height={12}
                        width={12}
                        color="#E4CC77"
                      />

                      <Text className="text-xs">5</Text>
                    </Badge>
                    <Badge
                      variant={"outline"}
                      className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                    >
                      <Text className="text-xs">+4</Text>
                    </Badge>
                  </View>
                </View>
              </View>
            )}
          />
        </View>

        {/* <View style={{ height: 600 }} /> */}
      </Animated.ScrollView>
      <Animated.View
        style={[
          rTopGradientStyle,
          StyleSheet.absoluteFillObject,
          { height: grossHeight },
        ]}
      >
        <TopGradient />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  borderCurve: {
    borderCurve: "continuous",
  },
});

// raycast-home-search-transition-animation 🔼
