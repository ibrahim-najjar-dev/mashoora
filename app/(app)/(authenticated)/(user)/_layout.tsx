import { useAuth } from "@clerk/clerk-expo";
import {
  LogLevel,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { useAction } from "convex/react";
import { Stack, useRouter } from "expo-router";
import { Check, X } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, TouchableOpacity } from "react-native";
import { Button } from "~/components/ui/button";
import Icons from "~/components/ui/icons";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { View } from "~/components/ui/view";
import { NAV_THEME } from "~/constants/Colors";
import { api } from "~/convex/_generated/api";
import { useColorScheme } from "~/lib/useColorScheme";

const LayoutContent = () => {
  const { isSignedIn } = useAuth();

  const isAuth = isSignedIn || false;

  const { colorScheme } = useColorScheme();

  const router = useRouter();

  return (
    <Stack>
      <Stack.Protected guard={isAuth}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modal)/modal"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modal)/settings"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modal)/split"
          options={{
            presentation: "fullScreenModal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modal)/availability-screen"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modal)/booking/[bookingId]"
          options={{
            presentation: "modal",
            headerTitle: "",
            headerShown: true,
            headerShadowVisible: false,
            headerRight: () => (
              <Button
                size={"icon"}
                variant={"secondary"}
                className="rounded-2xl h-12 w-12"
                style={{
                  borderCurve: "continuous",
                }}
                onPress={() => {
                  router.back();
                }}
              >
                <X
                  height={20}
                  width={20}
                  color={NAV_THEME[colorScheme].muted}
                />
              </Button>
            ),
            headerLeft: ({}) => (
              <Button
                size={"icon"}
                variant={"secondary"}
                className="rounded-2xl h-12 w-12"
                style={{
                  borderCurve: "continuous",
                }}
              >
                <Icons.SolarShareBold
                  height={20}
                  width={20}
                  color={NAV_THEME[colorScheme].muted}
                />
              </Button>
            ),
          }}
        />
        <Stack.Screen
          name="(modal)/service/[serviceId]/index"
          options={{
            presentation: "modal",
            headerTitle: "",
            headerShown: false,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="(modal)/service/[serviceId]/date-picker"
          options={{
            presentation: "modal",
            headerTitle: "",
            headerShown: false,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="(modal)/chat/index"
          options={{
            presentation: "modal",
            headerTitle: "chat",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="(modal)/profile"
          options={{
            presentation: "modal",
            headerTitle: "",
            headerShown: false,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="(modal)/inbox"
          options={{
            presentation: "modal",
            headerTitle: "",
            headerShown: true,
            headerStyle: {},
            headerShadowVisible: false,
            headerLeft: ({ canGoBack }) => (
              <Pressable
                className="flex-row items-center gap-x-2"
                onPress={() => {
                  router.back();
                }}
              >
                <Icons.SolarInboxBoldDuotone
                  height={20}
                  width={20}
                  color={NAV_THEME[colorScheme].muted}
                />
                <Text className="text-base text-foreground font-Geist_Regular">
                  Inbox
                </Text>
              </Pressable>
            ),
            headerRight: () => (
              <View className="flex-row items-center gap-x-2">
                <TouchableOpacity className="flex-row items-center justify-center gap-x-2">
                  <Check
                    height={18}
                    width={18}
                    color={NAV_THEME[colorScheme].muted}
                  />
                  <Text className="text-sm text-foreground font-Geist_Regular">
                    Select
                  </Text>
                </TouchableOpacity>
                <Separator
                  orientation="vertical"
                  className="h-4 bg-border mx-2"
                />
                <TouchableOpacity className="flex-row items-center justify-center gap-x-2">
                  <Icons.SolarTuning2BoldDuotone
                    height={18}
                    width={18}
                    color={NAV_THEME[colorScheme].muted}
                  />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="(modal)/search"
          options={{
            headerTitle: "Search",
            headerSearchBarOptions: {
              onChangeText: (text) => {},
              onSearchButtonPress: ({ nativeEvent: { text } }) => {
                // Handle search button press
                console.log("Search button pressed", text);
                // push same router with q
                router.push({
                  pathname: "/(app)/(authenticated)/(user)/(modal)/search",
                  params: { q: text },
                });
              },
              placement: "stacked",
            },
            headerBackButtonDisplayMode: "minimal",
          }}
        />
        <Stack.Screen
          name="(modal)/filter"
          options={{
            presentation: "modal",
            headerTitle: "Filter",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="(modal)/about"
          options={{
            presentation: "modal",
            headerTitle: "About",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="(modal)/payment-success"
          options={{
            presentation: "modal",
            headerTitle: "Payment Success",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="(modal)/video/[id]"
          options={{
            presentation: "fullScreenModal",
            headerTitle: "Video Call",
            headerShown: false,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
};

export default function Layout() {
  const { userId: clerkUserId } = useAuth();

  const getToken = useAction(api.stream.tokenProvider);

  const tokenProvider = useMemo(() => {
    return async () => {
      // call your Convex action that returns the Stream token
      const token = await getToken();
      return token as string;
    };
  }, [getToken]);

  const client = StreamVideoClient.getOrCreateInstance({
    apiKey: "94x5m4zdjsse",
    user: {
      id: clerkUserId!,
    },
    tokenProvider: tokenProvider,
    options: {
      logger: (logLevel: LogLevel, message: string, ...args: unknown[]) => {
        console.log(`[${logLevel}] ${message}`, ...args);
      },
    },
  });

  return (
    <StreamVideo client={client}>
      <LayoutContent />
    </StreamVideo>
  );
}
