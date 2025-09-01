import {
  CallingState,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import { Text, View } from "react-native";
import { Button } from "../ui/button";
import Icons from "../ui/icons";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { useRouter } from "expo-router";

const HangupButton = () => {
  const call = useCall();

  const router = useRouter();

  const { colorScheme } = useColorScheme();

  const { useCallCallingState } = useCallStateHooks();
  const callingState: CallingState = useCallCallingState();

  const onCallHangupHandler = async () => {
    console.log("Hanging up call");
    // console.log(call?.state.);
    console.log(callingState);
    if (callingState === CallingState.LEFT) router.back();
    await call?.leave();
    router.back();
  };

  return (
    <Button onPress={onCallHangupHandler} size={"icon"} variant={"ghost"}>
      <Icons.SolarCallCancelRoundedBoldDuotone
        color={NAV_THEME[colorScheme].text}
        height={24}
        width={24}
      />
    </Button>
  );
};

export default HangupButton;
