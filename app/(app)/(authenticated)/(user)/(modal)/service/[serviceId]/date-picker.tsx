import { View } from "~/components/ui/view";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import React from "react";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useLocalSearchParams } from "expo-router";
import {
  Alert,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Button } from "~/components/ui/button";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeInDown,
} from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "~/lib/utils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Error boundary for calendar component
class CalendarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Check if it's a navigation error we can ignore
    if (error.message?.includes("navigation context")) {
      console.warn(
        "Navigation context error caught and ignored:",
        error.message
      );
      return { hasError: false }; // Don't show error UI for navigation errors
    }
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    if (!error.message?.includes("navigation context")) {
      console.error("Calendar error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="p-4 bg-muted rounded-lg">
          <Text className="text-muted-foreground text-center">
            Calendar temporarily unavailable
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Animated TimeSlot Component
const AnimatedTimeSlot = React.memo(
  ({
    slot,
    index,
    isSelected,
    onPress,
  }: {
    slot: any;
    index: number;
    isSelected: boolean;
    onPress: () => void;
  }) => {
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).duration(500)}
        style={{
          marginBottom: 4,
          backgroundColor: "transparent",
        }}
      >
        <Button
          onPress={onPress}
          className={cn("rounded-xl", {
            "bg-primary text-primary-foreground": isSelected,
          })}
          variant={"outline"}
          style={{ borderCurve: "continuous" }}
        >
          <Text className="text-foreground">{slot.displayTime}</Text>
        </Button>
      </Animated.View>
    );
  }
);

AnimatedTimeSlot.displayName = "AnimatedTimeSlot";

const DatePicker = () => {
  const { colorScheme } = useColorScheme();
  const { serviceId } = useLocalSearchParams();
  // console.log("Service ID from date picker:", serviceId);

  const router = useRouter();

  const insets = useSafeAreaInsets();

  // For testing purposes, we'll use a dummy consultant clerk user ID
  // In a real app, you would get this from the service details or user session
  const dummyConsultantClerkUserId = "4564564564564";

  const [selected, setSelected] = React.useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string | null>(
    null
  );

  // Query to get available dates for the consultant
  const availableDates = useQuery(
    api.availability.getConsultantAvailableDates,
    {
      consultantClerkUserId: dummyConsultantClerkUserId,
    }
  );

  // Query to get weekly availability to show which days are available
  const weeklyAvailability = useQuery(
    api.availability.getConsultantAvailability,
    {
      clerkUserId: dummyConsultantClerkUserId,
    }
  );

  // Query to get available time slots for the selected date
  const availableSlots = useQuery(
    api.availability.getConsultantAvailableSlots,
    selected
      ? {
          consultantClerkUserId: dummyConsultantClerkUserId,
          date: selected,
        }
      : "skip"
  );

  // Mutations for testing
  const createDummyData = useMutation(api.availability.createDummyAvailability);
  const createDummyConsultant = useMutation(
    api.availability.createDummyConsultant
  );

  // Create marked dates object for the calendar
  const markedDates = React.useMemo(() => {
    const marked: { [key: string]: any } = {};

    // Mark available dates
    if (availableDates) {
      availableDates.forEach((date) => {
        marked[date] = {
          marked: true,
          dotColor: NAV_THEME[colorScheme].primary,
          disabled: false,
        };
      });
    }

    // Mark selected date
    if (selected) {
      marked[selected] = {
        ...marked[selected],
        selected: true,
        disableTouchEvent: true,
        selectedColor: NAV_THEME[colorScheme].primary,
      };
    }

    return marked;
  }, [availableDates, selected, colorScheme]);

  // Handle day press - only allow selection of available dates
  const handleDayPress = (day: any) => {
    try {
      // console.log("Day press initiated:", day.dateString);
      if (availableDates?.includes(day.dateString)) {
        // console.log("Setting selected date:", day.dateString);
        setSelected(day.dateString);
        setSelectedTimeSlot(null); // Reset selected time slot when date changes
        // console.log("Date selection successful");
      } else {
        Alert.alert(
          "Date Not Available",
          "This date is not available for booking. Please select a marked date."
        );
      }
    } catch (error) {
      console.error("Error in handleDayPress:", error);
    }
  };

  // Handle time slot selection
  const handleTimeSlotPress = React.useCallback((slot: any) => {
    try {
      // console.log("Selected time slot:", slot.startTime);
      setSelectedTimeSlot(slot.startTime);
      // console.log("Time slot selection successful");
    } catch (error) {
      console.error("Error in handleTimeSlotPress:", error);
    }
  }, []);

  return (
    <View className="flex-1 bg-background">
      {/* Debug/Test Section */}

      {/* Calendar - Wrapped to prevent navigation errors */}

      <Calendar
        onDayPress={handleDayPress}
        disableAllTouchEventsForInactiveDays
        markedDates={markedDates}
        current={new Date().toISOString().split("T")[0]}
        minDate={new Date().toISOString().split("T")[0]} // Disable past dates
        enableSwipeMonths={false} // Disable to prevent navigation issues
        hideArrows={false}
        hideExtraDays={true}
        disableMonthChange={false}
        theme={{
          backgroundColor: NAV_THEME[colorScheme].background,
          calendarBackground: NAV_THEME[colorScheme].background,
          textSectionTitleColor: NAV_THEME[colorScheme].text,
          todayTextColor: NAV_THEME[colorScheme].primary,
          dayTextColor: NAV_THEME[colorScheme].text,
          selectedDayBackgroundColor: NAV_THEME[colorScheme].primary,
          selectedDayTextColor: NAV_THEME[colorScheme].background,
          arrowColor: NAV_THEME[colorScheme].primary,
          selectedDotColor: NAV_THEME[colorScheme].primary,
          monthTextColor: NAV_THEME[colorScheme].text,
          textDisabledColor: NAV_THEME[colorScheme].muted,
          textInactiveColor: NAV_THEME[colorScheme].muted,
          todayButtonTextColor: NAV_THEME[colorScheme].primary,
          dotColor: NAV_THEME[colorScheme].primary,
          ...({
            "stylesheet.day.basic": {
              selected: {
                backgroundColor: NAV_THEME[colorScheme].primary,
                borderRadius: 8,
              },
            },
          } as any),
        }}
      />

      {/* Selected Date and Time Slots */}
      {selected ? (
        <View className=" flex-1">
          {/* Available Time Slots */}
          {availableSlots && availableSlots.length > 0 && (
            <View style={{ flex: 1, minHeight: 300 }}>
              <MaskedView
                maskElement={
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    colors={["transparent", "black", "black", "transparent"]}
                    locations={[0, 0.1, 0.9, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                }
                style={{ flex: 1 }}
              >
                <ScrollView
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                  }}
                  className="px-8"
                  contentContainerStyle={{
                    paddingBottom: 20,
                    paddingHorizontal: 4,
                    paddingTop: 20,
                  }}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {availableSlots.map((slot, index) => {
                    // console.log(`Rendering slot ${index}:`, slot);
                    const isSelected = selectedTimeSlot === slot.startTime;
                    return (
                      <View
                        key={`${slot.startTime}-${index}`}
                        style={{ marginBottom: 12 }}
                      >
                        <AnimatedTimeSlot
                          slot={slot}
                          index={index}
                          isSelected={isSelected}
                          onPress={() => handleTimeSlotPress(slot)}
                        />
                      </View>
                    );
                  })}
                </ScrollView>
              </MaskedView>
            </View>
          )}

          {/* Debug: Show available slots data */}

          {/* No slots available message */}
          {availableSlots && availableSlots.length === 0 && (
            <View className="p-4 bg-muted rounded-lg">
              <Text className="text-muted-foreground text-center">
                No time slots available for this date.
              </Text>
            </View>
          )}

          {/* Confirm Button */}
          {/* {selected && selectedTimeSlot && (
            <View className="mt-6">
              <Button
                onPress={() => {
                  const selectedSlot = availableSlots?.find(
                    (slot) => slot.startTime === selectedTimeSlot
                  );
                  Alert.alert(
                    "Booking Confirmed",
                    `Date: ${new Date(selected).toLocaleDateString()}\nTime: ${selectedSlot?.displayTime}`,
                    [{ text: "OK" }]
                  );
                }}
                className="w-full"
              >
                <Text className="text-primary-foreground font-medium">
                  Confirm Booking
                </Text>
              </Button>
            </View>
          )} */}
        </View>
      ) : (
        <View className="flex-1 items-center px-4 pt-20">
          <Text className="text-muted-foreground text-center text-sm ">
            Please select a date to see available time slots.
          </Text>
        </View>
      )}
      <View
        className="px-4"
        style={{
          paddingBottom: insets.bottom,
        }}
      >
        <Button
          variant="secondary"
          onPress={() => {
            router.push({
              pathname: "/(app)/(authenticated)/(user)/(modal)/payment",
              params: {
                serviceId,
                selectedDate: selected,
                selectedTimeSlot,
              },
            });
          }}
          size={"lg"}
          className="rounded-2xl"
          disabled={!selected || !selectedTimeSlot}
        >
          <Text className="text-foreground font-Geist_SemiBold text-lg">
            Next
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default DatePicker;
