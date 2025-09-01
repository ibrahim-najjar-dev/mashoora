import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";

const Layout = () => {
  const { isSignedIn } = useAuth();

  const isAuth = isSignedIn || false;

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <Stack.Protected guard={isAuth}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modal)/sign-in"
          options={{
            presentation: "modal",
            title: "Add Account",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modal)/availability"
          options={{
            presentation: "modal",
            title: "Availability",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modal)/create-service"
          options={{
            presentation: "modal",
            title: "Create Service",
            // headerShown: false,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
};

export default Layout;
