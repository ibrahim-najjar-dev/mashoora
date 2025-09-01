import { BlurView } from "expo-blur";
import { Mic, PhoneOff, UserIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { Button } from "../ui/button";
import {
  CallContent,
  useCall,
  useCallStateHooks,
  useStreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { useRouter } from "expo-router";

type Props = {
  onPressPosition: (index: 0 | 1 | 2) => void;
};

const ScaleButton = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.9, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 100 });
      }}
      onPress={onPress}
    >
      <Animated.View
        style={[
          {
            backgroundColor: "#eee",
            height: 100,
            width: 100,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
          },
          animatedStyle,
        ]}
      >
        <Text style={{ fontWeight: "bold", fontSize: 20 }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

export default function Spilt1({ onPressPosition }: Props) {
  const { colorScheme } = useColorScheme();

  const router = useRouter();

  const { useCallState } = useCallStateHooks();
  const callState = useCallState();

  // const client = useStreamVideoClient();

  const call = useCall();

  const [isDue, setIsDue] = useState(true); // default true for backward compatibility
  const [countdown, setCountdown] = useState<number | null>(null);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);

  // const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  // const hangupCallHandler = useCallback(async () => {
  //   try {
  //     if (callingState === CallingState.LEFT) {
  //       return;
  //     }
  //     await call?.leave({ reject: true, reason: "cancel" });
  //   } catch (error) {
  //     console.log("Error rejecting Call", error);
  //   }
  // }, [call, callingState]);

  // Debug: log startsAt when call changes
  useEffect(() => {
    if (!callState) return;
    const startsAt = callState.startsAt;
    console.log("[DEBUG] call.state.startsAt:", startsAt);
    if (!startsAt) {
      setIsDue(false);
      setScheduledTime(null);
      setCountdown(null);
      call?.leave({
        reason: "timeout",
      });
    }
    const scheduled = new Date(startsAt!);
    // const scheduled = new Date(startsAt);
    setScheduledTime(scheduled);
    const now = new Date();

    // console.log("[DEBUG] testScheduled:", testScheduled);
    const diff = scheduled.getTime() - now.getTime();
    if (diff > 0) {
      setIsDue(false);
      setCountdown(diff);
      call?.leave({
        reason: "timeout",
      });
      console.log("Call is not yet due, leaving call.");
      return;
    }
    setIsDue(true);
    setCountdown(null);
  }, [call]);

  // Countdown timer effect (must be top-level, not nested)
  useEffect(() => {
    if (isDue || countdown === null || !scheduledTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = scheduledTime.getTime() - now.getTime();
      if (diff <= 0) {
        setIsDue(true);
        setCountdown(null);
        clearInterval(interval);
      } else {
        setCountdown(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isDue, countdown, scheduledTime]);

  // if (!isDue && countdown !== null && scheduledTime) {
  //   // Format countdown as HH:MM:SS
  //   const totalSeconds = Math.floor(countdown / 1000);
  //   const hours = Math.floor(totalSeconds / 3600);
  //   const minutes = Math.floor((totalSeconds % 3600) / 60);
  //   const seconds = totalSeconds % 60;
  //   const pad = (n: number) => n.toString().padStart(2, "0");
  //   return (
  //     <View className="flex-1 items-center justify-center">
  //       <Text className="text-xl text-foreground">
  //         Call will start in {pad(hours)}:{pad(minutes)}:{pad(seconds)}
  //       </Text>
  //     </View>
  //   );
  // }

  const formatCountdown = () => {
    if (countdown === null || !scheduledTime) return null;

    const totalSeconds = Math.floor(countdown / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl text-foreground">
          Call will start in {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 flex-row items-center justify-center rounded-b-2xl bg-secondary relative overflow-hidden gap-x-5 px-10">
      {isDue ? (
        <CallContent
          onHangupCallHandler={() => router.back()}
          layout="grid"
          CallControls={() => <></>}
        />
      ) : countdown !== null && scheduledTime ? (
        formatCountdown()
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl text-foreground">
            Preparing your call...
          </Text>
        </View>
      )}
    </View>
  );
}
