// import {
//   Call,
//   CallContent,
//   CallingState,
//   StreamCall,
//   useStreamVideoClient,
// } from "@stream-io/video-react-native-sdk";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SpiltPanKit from "~/components/split-panel";

const VideoId = () => {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  console.log("[DEBUG] Local search params:", { id });

  const router = useRouter();

  // const [call, setCall] = useState<Call | null>(null);

  // const client = useStreamVideoClient();

  // useEffect(() => {
  //   if (!client) return;
  //   const _call = client.call("default", id as string);
  //   _call.join({ create: false }).then(() => {
  //     setCall(_call);
  //   });
  //   // Cleanup function that runs when component unmounts or dependencies change
  //   return () => {
  //     if (_call?.state.callingState !== CallingState.LEFT) {
  //       _call?.leave();
  //     }
  //   };
  // }, [id, client]);

  // if (!call) {
  //   return null;
  // }

  return (
    <View className="flex-1">
      {/* <StreamCall call={call}> */}
      <SpiltPanKit />
      {/* </StreamCall> */}
    </View>
  );
};

export default VideoId;
