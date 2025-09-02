// import { useCall } from "@stream-io/video-react-native-sdk";
import { Text, View } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";
import { Button } from "../ui/button";
import Icons from "../ui/icons";
import { NAV_THEME } from "~/constants/Colors";

const ToggleCameraFace = () => {
  // const call = useCall();
  const { colorScheme } = useColorScheme();

  // const toggleCameraFacingMode = async () => {
  //   // onPressHandler?.();
  //   await call?.camera.flip();
  // };

  // return (
  //   <Button onPress={toggleCameraFacingMode} size={"icon"} variant={"ghost"}>
  //     <Icons.SolarCameraRotateBoldDuotone
  //       color={NAV_THEME[colorScheme].text}
  //       height={24}
  //       width={24}
  //     />
  //   </Button>
  // );
  return <></>;
};

export default ToggleCameraFace;
