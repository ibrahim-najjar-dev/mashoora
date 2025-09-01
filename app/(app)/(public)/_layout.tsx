import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen
        name="sign-up"
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="sign-in"
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />
    </Stack>
  );
};

export default Layout;
