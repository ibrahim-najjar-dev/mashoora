import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  console.log("Expo Push Token:", expoPushToken);

  const recordToken = useMutation(
    api.notifications.recordPushNotificationToken
  );

  // Function to register for push notifications
  async function registerForPushNotificationsAsync() {
    try {
      // Check if the app is running on a physical device
      if (!Device.isDevice) {
        setPermissionStatus("Must use physical device for push notifications");
        return null;
      }

      // Configure Android notification channel
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      // Request notification permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // If permission is not granted, request it
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // If permission is not granted, return
      if (finalStatus !== "granted") {
        setPermissionStatus("Permission not granted for push notifications");
        return null;
      }

      setPermissionStatus("granted");

      // Get the project ID from Constants
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.error("Project ID not found");
        return null;
      }

      // Get the push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return token.data;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      setPermissionStatus(`Error: ${error}`);
      return null;
    }
  }

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        // Send token to Convex backend
        recordToken({ token }).catch((err) =>
          console.error("Failed to record push token:", err)
        );
      }
    });

    // Set up notification listeners
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        // Handle notification response (e.g., navigate to a specific screen)
      });

    // Clean up listeners on unmount
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return {
    expoPushToken,
    notification,
    permissionStatus,
  };
}
