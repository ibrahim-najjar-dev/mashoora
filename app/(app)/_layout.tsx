// import { useAuth } from "@clerk/clerk-expo";
// import { Redirect, Slot, useSegments } from "expo-router";

import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Slot, useSegments } from "expo-router";

const Layout = () => {
  const segment = useSegments();
  const isAuthGroup = segment[1] === "(authenticated)";
  const { isSignedIn } = useAuth();

  if (isAuthGroup && !isSignedIn) {
    console.log("User is not signed in, redirecting to sign-in page");
    return <Redirect href={"/(app)/(public)/sign-in"} />;
  }

  if (!isAuthGroup && isSignedIn) {
    console.log("User is signed in, redirecting to user tabs");
    return <Redirect href={"/(app)/(authenticated)/(user)/(tabs)"} />;
  }

  return <Slot />;
};

export default Layout;
