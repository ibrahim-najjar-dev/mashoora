import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useAuth } from "@clerk/clerk-expo";
import { Plus, X, Save, RotateCcw } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  Switch,
  Text,
  View,
  Alert,
  StyleSheet,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  Layout,
  FadeInDown,
  FadeOutUp,
  FadeOut,
} from "react-native-reanimated";
import { minutesTo12HourFormat } from "~/constants";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { useConsultantAvailability } from "~/hooks/use-consultant-availability";
import { Button } from "./ui/button";
import TimePicker from "./ui/timepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Icons from "./ui/icons";

// Helper functions to convert between time formats
const timeStringToMinutes = (timeString: string): number => {
  const [time, period] = timeString.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let totalMinutes = minutes;

  if (period?.toLowerCase() === "pm" && hours !== 12) {
    totalMinutes += (hours + 12) * 60;
  } else if (period?.toLowerCase() === "am" && hours === 12) {
    totalMinutes += 0;
  } else {
    totalMinutes += hours * 60;
  }

  return totalMinutes;
};

const minutesToTimeString = (minutes: number): string => {
  return minutesTo12HourFormat(minutes);
};

type AvailabilityPickerProps = {
  clerkUserId?: string; // Optional prop to override the authenticated user
};

const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  clerkUserId: propClerkUserId,
}) => {
  const { userId: authUserId } = useAuth();
  const clerkUserId = propClerkUserId || authUserId;

  // Use the custom hook for availability management
  const {
    availability: days,
    hasUnsavedChanges,
    isLoading,
    toggleDayActive,
    addTimeRange,
    removeTimeRange,
    updateTimeInRange,
    saveAvailability,
    resetChanges,
  } = useConsultantAvailability(clerkUserId || "");

  // Local state for UI management
  const [selectedTime, setSelectedTime] = useState<string>("540"); // 9:00 AM in minutes
  const [currentTimeContext, setCurrentTimeContext] = useState<{
    dayIndex: number;
    rangeIndex: number;
    timeType: "from" | "to";
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(0);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const actionBarOffset = useSharedValue(100); // Start hidden (100px below)

  useEffect(() => {
    // Animate up when there are unsaved changes, down when none
    actionBarOffset.value = withSpring(
      hasUnsavedChanges ? -insets.bottom : 400,
      {
        damping: 20,
        stiffness: 150,
      }
    );
  }, [hasUnsavedChanges]);

  const actionBarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: actionBarOffset.value }],
  }));

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const insets = useSafeAreaInsets();

  const handleClosePress = () => bottomSheetRef.current?.close();

  const handleOpenTimeSelector = (
    dayIndex: number,
    rangeIndex: number,
    timeType: "from" | "to",
    currentValue: string
  ) => {
    setCurrentTimeContext({ dayIndex, rangeIndex, timeType });
    setSelectedTime(timeStringToMinutes(currentValue).toString());

    // Scroll to the selected day card to keep it visible above the bottom sheet
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: dayIndex,
        animated: true,
        viewPosition: 0.3, // Position the item at 30% from the top
      });
    }, 100);

    bottomSheetRef.current?.expand();
  };

  const handleTimeConfirm = () => {
    if (currentTimeContext) {
      const { dayIndex, rangeIndex, timeType } = currentTimeContext;
      updateTimeInRange(
        dayIndex,
        rangeIndex,
        timeType,
        minutesToTimeString(parseInt(selectedTime))
      );
    }
    bottomSheetRef.current?.close();
    setCurrentTimeContext(null);
  };

  // Handle save functionality
  const handleSave = async () => {
    if (!clerkUserId) {
      Alert.alert("Error", "No user ID found. Please sign in again.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveAvailability();
      if (result.success) {
        Alert.alert("Success", "Your availability has been saved!");
      } else {
        Alert.alert("Error", "Failed to save availability. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save availability. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset functionality
  const handleReset = () => {
    Alert.alert(
      "Reset Changes",
      "Are you sure you want to reset all unsaved changes?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetChanges },
      ]
    );
  };

  const { colorScheme } = useColorScheme();

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg font-Geist_Medium text-foreground">
          Loading availability...
        </Text>
      </View>
    );
  }

  // Show error if no user ID
  if (!clerkUserId) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-lg font-Geist_Medium text-foreground text-center">
          Please sign in to manage your availability
        </Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 items-center justify-center bg-background px-4">
        {/* availability picker with all days */}
        <FlatList
          ref={flatListRef}
          data={days}
          keyExtractor={(item) => item.day}
          renderItem={({ item, index }) => (
            <DayCard
              day={item.day}
              dayIndex={index}
              isActive={item.isActive}
              onToggleActive={() => toggleDayActive(index)}
              timesRanges={item.timesRanges}
              onAddTimeRange={() => addTimeRange(index)}
              onRemoveTimeRange={(rangeIndex) =>
                removeTimeRange(index, rangeIndex)
              }
              onTimePress={(rangeIndex, timeType, currentValue) =>
                handleOpenTimeSelector(
                  index,
                  rangeIndex,
                  timeType,
                  currentValue
                )
              }
              currentTimeContext={currentTimeContext}
            />
          )}
          ListHeaderComponent={() => (
            <View className="mb-4">
              <Text className="text-2xl font-Geist_Medium text-foreground mb-2">
                Set Your Availability
              </Text>

              {/* Action buttons */}
            </View>
          )}
          className="w-full gap-y-4 pt-safe"
          contentContainerStyle={{
            paddingBottom: 400, // Dynamic padding based on bottom sheet state
          }}
          showsVerticalScrollIndicator={false}
          getItemLayout={(data, index) => ({
            length: 120, // Approximate height of each day card (adjust as needed)
            offset: 120 * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            // Fallback if scrollToIndex fails
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }, 100);
          }}
        />
        <Animated.View
          style={{
            // paddingBottom: insets.bottom,
            ...actionBarStyle,
          }}
          className="absolute inset-x-0 bottom-0"
        >
          {/* action bar */}
          <View className="flex-row gap-3 px-5 rounded-2xl overflow-hidden border border-border w-[300px] mx-auto py-3">
            <BlurView
              intensity={80}
              tint={colorScheme === "dark" ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
              className="rounded-2xl"
            />
            <Button
              onPress={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className="flex-1 flex-row items-center justify-center gap-x-2 rounded-2xl"
              variant={"outline"}
            >
              <Icons.SolarCheckSquareBold
                height={16}
                width={16}
                color={NAV_THEME[colorScheme].text}
              />
              <Text className={"font-Geist_Medium text-foreground"}>
                {isSaving ? "Saving..." : "Save changes"}
              </Text>
            </Button>

            <Button
              onPress={handleReset}
              disabled={!hasUnsavedChanges}
              variant="outline"
              className="flex-row items-center justify-center gap-x-2 rounded-2xl"
            >
              <Icons.SolarCloseSquareBold
                height={16}
                width={16}
                color={NAV_THEME[colorScheme].text}
              />
              <Text className="font-Geist_Medium text-foreground">Reset</Text>
            </Button>
          </View>
        </Animated.View>
      </View>
      <BottomSheet
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={-1} // Start closed
        enableDynamicSizing
        backgroundStyle={{ backgroundColor: NAV_THEME[colorScheme].secondary }}
        handleIndicatorStyle={{ backgroundColor: NAV_THEME[colorScheme].text }}
        enablePanDownToClose
        onChange={(index) => {
          // Track bottom sheet state and reset context when closed
          setIsBottomSheetOpen(index !== -1);
          if (index === -1) {
            setCurrentTimeContext(null);
          }
        }}
      >
        <BottomSheetView className="px-4">
          <View className="flex-1">
            {currentTimeContext && (
              <View className="mb-4 p-3 bg-background rounded-2xl">
                <Text className="text-sm font-Geist_Medium text-muted-foreground text-center">
                  Editing {days[currentTimeContext.dayIndex].day}
                </Text>
                <Text className="text-lg font-Geist_SemiBold text-foreground text-center">
                  {currentTimeContext.timeType === "from" ? "Start" : "End"}{" "}
                  Time
                </Text>
                <Text className="text-sm text-muted-foreground text-center">
                  Range {currentTimeContext.rangeIndex + 1}
                </Text>
              </View>
            )}

            <TimePicker
              handleChange={(time) => {
                setSelectedTime(time);
              }}
              value={selectedTime}
            />
          </View>
          <View className="pb-8 pt-4">
            <Button onPress={handleTimeConfirm} className="w-full">
              <Text className="text-background font-Geist_Medium">Done</Text>
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

const DayCard: React.FC<{
  day: string;
  dayIndex: number;
  isActive: boolean;
  onToggleActive: () => void;
  timesRanges: { from: string; to: string }[];
  onAddTimeRange: () => void;
  onRemoveTimeRange: (rangeIndex: number) => void;
  onTimePress: (
    rangeIndex: number,
    timeType: "from" | "to",
    currentValue: string
  ) => void;
  currentTimeContext: {
    dayIndex: number;
    rangeIndex: number;
    timeType: "from" | "to";
  } | null;
}> = ({
  day,
  dayIndex,
  isActive,
  onToggleActive,
  timesRanges,
  onAddTimeRange,
  onRemoveTimeRange,
  onTimePress,
  currentTimeContext,
}) => {
  const { colorScheme } = useColorScheme();

  return (
    <Animated.View className="" layout={Layout.duration(300)}>
      <View
        className="w-full p-4 bg-secondary rounded-3xl mb-4"
        style={{ borderCurve: "continuous" }}
      >
        <Pressable
          className="flex-row items-center justify-between"
          onPress={() => {
            if (!isActive) {
              onToggleActive();
            }
          }}
        >
          <Text className="text-lg font-Geist_Medium text-foreground">
            {day}
          </Text>
          <Switch value={isActive} onValueChange={onToggleActive} />
        </Pressable>
        {isActive && (
          <Animated.View
            className="bg-background p-4 rounded-2xl mt-2 gap-y-2"
            style={{ borderCurve: "continuous" }}
            layout={Layout.duration(250)}
          >
            {timesRanges.map((range, index) => (
              <Animated.View
                key={`${dayIndex}-${index}`}
                layout={Layout.duration(200)}
                entering={FadeInDown.delay(30).duration(300)}
              >
                <TimeRangeRow
                  rangeIndex={index}
                  dayIndex={dayIndex}
                  from={range.from}
                  to={range.to}
                  onDelete={() => {
                    onRemoveTimeRange(index);
                  }}
                  onTimePress={(timeType, currentValue) =>
                    onTimePress(index, timeType, currentValue)
                  }
                  currentTimeContext={currentTimeContext}
                />
              </Animated.View>
            ))}
            <Button
              variant={"secondary"}
              className="w-full flex-row items-center justify-center gap-x-1.5"
              size={"sm"}
              onPress={onAddTimeRange}
            >
              <Plus size={16} color={NAV_THEME[colorScheme].text} />
              <Text className="font-Geist_Medium text-foreground">
                Add More
              </Text>
            </Button>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

const TimeRangeRow: React.FC<{
  rangeIndex: number;
  dayIndex: number;
  from: string;
  to: string;
  onDelete: () => void;
  onTimePress: (timeType: "from" | "to", currentValue: string) => void;
  currentTimeContext: {
    dayIndex: number;
    rangeIndex: number;
    timeType: "from" | "to";
  } | null;
}> = ({
  rangeIndex,
  dayIndex,
  from,
  to,
  onDelete,
  onTimePress,
  currentTimeContext,
}) => {
  const { colorScheme } = useColorScheme();

  // Check if this specific time slot is being edited
  const isFromBeingEdited =
    currentTimeContext?.dayIndex === dayIndex &&
    currentTimeContext?.rangeIndex === rangeIndex &&
    currentTimeContext?.timeType === "from";

  const isToBeingEdited =
    currentTimeContext?.dayIndex === dayIndex &&
    currentTimeContext?.rangeIndex === rangeIndex &&
    currentTimeContext?.timeType === "to";

  return (
    <View className="flex-row items-center gap-x-1.5">
      <Text className="font-Geist_Medium text-muted-foreground">From</Text>
      <Pressable
        className={`flex-1 h-10 items-center justify-center border rounded-md ${
          isFromBeingEdited ? "border-primary bg-primary/10" : "border-border"
        }`}
        onPress={() => onTimePress("from", from)}
      >
        <Text
          className={`font-Mono_Medium text-base ${
            isFromBeingEdited
              ? "text-primary font-Mono_SemiBold"
              : "text-muted-foreground"
          }`}
        >
          {from}
        </Text>
      </Pressable>
      <Text className="font-Geist_Medium text-muted-foreground">To</Text>
      <Pressable
        className={`flex-1 h-10 items-center justify-center border rounded-md ${
          isToBeingEdited ? "border-primary bg-primary/10" : "border-border"
        }`}
        onPress={() => onTimePress("to", to)}
      >
        <Text
          className={`font-Mono_Medium text-base ${
            isToBeingEdited
              ? "text-primary font-Mono_SemiBold"
              : "text-muted-foreground"
          }`}
        >
          {to}
        </Text>
      </Pressable>
      <Button variant={"secondary"} size={"icon"} onPress={onDelete}>
        <X size={16} color={NAV_THEME[colorScheme].text} />
      </Button>
    </View>
  );
};

export default AvailabilityPicker;
