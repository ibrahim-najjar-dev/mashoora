// import { useCall, useCallStateHooks } from "@stream-io/video-react-native-sdk";
import { Text, View } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { Button } from "../ui/button";
import Icons from "../ui/icons";
import { NAV_THEME } from "~/constants/Colors";

const ToggleAudioButton = () => {
  // const call = useCall();
  // const { useMicrophoneState } = useCallStateHooks();
  // const { status } = useMicrophoneState();

  const { colorScheme } = useColorScheme();

  // const toggleAudioMuted = async () => {
  //   await call?.microphone.toggle();
  // };
  // return (
  //   <Button onPress={toggleAudioMuted} size={"icon"} variant={"ghost"}>
  //     <Icons.SolarMicrophone3BoldDuotone
  //       color={
  //         status === "disabled"
  //           ? NAV_THEME[colorScheme].text
  //           : NAV_THEME[colorScheme].muted
  //       }
  //       height={24}
  //       width={24}
  //     />
  //   </Button>
  // );
  return <></>;
};

export default ToggleAudioButton;
