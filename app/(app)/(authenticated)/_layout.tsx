import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import usePushNotifications from "~/hooks/use-push";
import {
  useRole,
  useRoleWithSessionClaims,
  isOnBoardingCompleted,
} from "~/lib/auth";

const Layout = () => {
  const { sessionClaims } = useAuth();

  usePushNotifications();
  return (
    <Stack>
      <Stack.Protected
        guard={
          useRoleWithSessionClaims({
            role: "user",
            sessionClaims,
          }) && isOnBoardingCompleted(sessionClaims)
        }
      >
        <Stack.Screen
          name="(user)"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>
      <Stack.Protected
        guard={
          useRoleWithSessionClaims({
            role: "consultant",
            sessionClaims,
          }) && isOnBoardingCompleted(sessionClaims)
        }
      >
        <Stack.Screen
          name="(consultant)"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>
      <Stack.Screen
        name="on-boarding"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default Layout;
