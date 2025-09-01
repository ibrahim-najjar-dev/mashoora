import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isThisWeek,
  isToday,
  isTomorrow,
  isWithinInterval,
  startOfWeek,
} from "date-fns";
import { BlurView } from "expo-blur";
import { Link, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Pressable, SectionList, TouchableOpacity } from "react-native";
import { Badge } from "../ui/badge";
import Icons from "../ui/icons";
import { FunctionReturnType } from "convex/server";
import { api } from "~/convex/_generated/api";
import { Doc } from "~/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/clerk-expo";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import * as ContextMenu from "zeego/context-menu";
import { Separator } from "../ui/separator";
import { View } from "../ui/view";
import { Text } from "../ui/text";
import { useLocalizedText } from "~/utils/localized-text";

type Booking = FunctionReturnType<
  typeof api.bookings.getBookingsWithServiceDataByClerkId
>[0];

// Custom function to check if a date is in next week
const isNextWeek = (date: Date): boolean => {
  const nextWeekStart = startOfWeek(addWeeks(new Date(), 1));
  const nextWeekEnd = endOfWeek(addWeeks(new Date(), 1));
  return isWithinInterval(date, { start: nextWeekStart, end: nextWeekEnd });
};
interface BookingSection {
  title: string;
  data: Booking[];
}

const groupBookingsByTime = (bookings: Booking[]): BookingSection[] => {
  const sections: BookingSection[] = [];

  // Group bookings
  const today: Booking[] = [];
  const tomorrow: Booking[] = [];
  const thisWeek: Booking[] = [];
  const nextWeek: Booking[] = [];
  const later: Booking[] = [];

  bookings.forEach((booking) => {
    const bookingDate = new Date(booking.date);

    if (isToday(bookingDate)) {
      today.push(booking);
    } else if (isTomorrow(bookingDate)) {
      tomorrow.push(booking);
    } else if (
      isThisWeek(bookingDate) &&
      !isToday(bookingDate) &&
      !isTomorrow(bookingDate)
    ) {
      thisWeek.push(booking);
    } else if (isNextWeek(bookingDate)) {
      nextWeek.push(booking);
    } else {
      later.push(booking);
    }
  });

  // Add sections only if they have data
  if (today.length > 0) sections.push({ title: "Today", data: today });
  if (tomorrow.length > 0) sections.push({ title: "Tomorrow", data: tomorrow });
  if (thisWeek.length > 0)
    sections.push({ title: "This Week", data: thisWeek });
  if (nextWeek.length > 0)
    sections.push({ title: "Next Week", data: nextWeek });
  if (later.length > 0) sections.push({ title: "Later", data: later });

  return sections;
};

const SectionHeader = ({ section }: { section: BookingSection }) => (
  <View
    className="border-b border-border/50 overflow-hidden"
    style={{ backgroundColor: "transparent" }}
  >
    <BlurView intensity={50} tint="dark" className="overflow-hidden px-4 py-3">
      <Text className="text-lg font-Geist_SemiBold text-foreground">
        {section.title}
      </Text>
    </BlurView>
  </View>
);

const BookingItem = ({
  item,
  colorScheme,
}: {
  item: Booking;
  colorScheme: "light" | "dark";
}) => {
  const router = useRouter();
  const [isLongPressActive, setIsLongPressActive] = useState(false);

  const handlePress = useCallback(() => {
    if (!isLongPressActive) {
      router.push({
        pathname: "/(app)/(authenticated)/(user)/(modal)/booking/[bookingId]",
        params: { bookingId: item._id },
      });
    }
    setTimeout(() => {
      setIsLongPressActive(false);
    }, 100);
  }, [isLongPressActive, router, item._id]);

  const handleLongPress = useCallback(() => {
    setIsLongPressActive(true);
  }, []);

  const handlePressOut = useCallback(() => {
    setTimeout(() => {
      setIsLongPressActive(false);
    }, 100);
  }, []);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressOut={handlePressOut}
      delayLongPress={200}
      activeOpacity={0.7}
    >
      <ContextMenu.Root>
        <ContextMenu.Trigger disabled={!isLongPressActive} asChild>
          <View className="px-4 py-3 bg-background flex-row items-center gap-3">
            <View className="h-14 w-14 bg-rose-500 rounded-xl overflow-hidden flex-center items-center justify-center">
              <Icons.SolarHeartPulseBoldDuotone
                width={39}
                height={39}
                color={NAV_THEME[colorScheme].text}
              />
            </View>
            <View className="flex-1 justify-center gap-1">
              <Text className="text-foreground font-Geist_SemiBold text-base line-clamp-1">
                {/* {item.service.name} */}
                {useLocalizedText(item.service.name, item.service.name_ar)}
              </Text>
              <View className="flex-row">
                <Badge
                  variant={"outline"}
                  className="px-1.5 rounded-md py-1 max-w-fit"
                >
                  <View className="gap-x-1.5 flex-row items-center">
                    <Avatar
                      alt="consultant-avatar"
                      className="w-4 h-4 bg-neutral-500 rounded"
                    >
                      <AvatarImage
                        source={{ uri: item.consultantUserProfile?.imageUrl }}
                      />
                      <AvatarFallback>
                        <Text className="text-foreground">
                          {item.consultantUserProfile?.firstName
                            ?.charAt(0)
                            .toUpperCase()}
                        </Text>
                      </AvatarFallback>
                    </Avatar>
                    <Text className="text-xs text-foreground font-Geist_Medium">
                      {item.consultantUserProfile?.firstName?.trim() +
                        " " +
                        item.consultantUserProfile?.lastName?.trim()}
                    </Text>
                  </View>
                </Badge>
              </View>
            </View>
            <View className="gap-1 items-end justify-center">
              <Text className="text-xs text-muted-foreground font-Geist_Regular">
                {format(item.date, "EEEE, MMMM d")}
              </Text>
              <Text className="text-xs text-foreground font-Geist_Regular">
                from{" "}
                <Text className="text-xs text-muted-foreground font-Geist_Regular">
                  {item.time}
                </Text>{" "}
                to{" "}
                <Text className="text-xs text-muted-foreground font-Geist_Regular">
                  {getEndTime(item.time, item.duration)}
                </Text>
              </Text>
            </View>
          </View>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Label />
          <ContextMenu.Item
            // i18nIsDynamicList={false}
            key="item-1"
            onSelect={() => console.log("item-1 selected")}
          >
            <ContextMenu.ItemTitle>Join now</ContextMenu.ItemTitle>
          </ContextMenu.Item>
          <ContextMenu.Item
            key="item-2"
            onSelect={() => console.log("item-2 selected")}
          >
            <ContextMenu.ItemTitle>View details</ContextMenu.ItemTitle>
          </ContextMenu.Item>
          <ContextMenu.Item
            key="item-2"
            onSelect={() => console.log("item-2 selected")}
          >
            <ContextMenu.ItemTitle>Add to favorites</ContextMenu.ItemTitle>
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Arrow />
        </ContextMenu.Content>
      </ContextMenu.Root>
    </TouchableOpacity>
  );
};

const getEndTime = (startTime: string, duration: number): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + duration * 60000);
  return endDate.toTimeString().slice(0, 5);
};

const Upcoming = () => {
  const bottomTabBarHeight = useBottomTabBarHeight();

  const { colorScheme } = useColorScheme();

  const { userId: clerkUserId } = useAuth();

  const data = useQuery(api.bookings.getBookingsWithServiceDataByClerkId, {
    clerkUserId: clerkUserId!,
  });

  const sections = groupBookingsByTime(data || []);

  return (
    <View className="flex-1">
      {sections.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground font-Geist_Regular">
            No upcoming bookings
          </Text>
        </View>
      ) : (
        <SectionList
          ItemSeparatorComponent={() => <Separator className="bg-border/20" />}
          sections={sections}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <BookingItem item={item} colorScheme={colorScheme} />
          )}
          renderSectionHeader={({ section }) => (
            <SectionHeader section={section} />
          )}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={true}
          contentContainerStyle={{ paddingBottom: 20 + bottomTabBarHeight }}
        />
      )}
    </View>
  );
};

export default Upcoming;
