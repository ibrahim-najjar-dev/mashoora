// import { useCallStateHooks } from "@stream-io/video-react-native-sdk";
import { Text, View } from "react-native";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Tab1 = () => {
  // const allParticipants = useParticipants();
  // const { useParticipants, useCallMembers } = useCallStateHooks();

  // const participants = useParticipants();
  // const callMembers = useCallMembers();

  // console.log(callMembers.length);/
  return (
    <View className="flex-1 p-4">
      <Text className="text-lg font-bold text-foreground">First Tab</Text>
      <View className="mt-4 gap-y-4">
        {/* {callMembers.map((member) => (
          <View key={member.user_id} className="flex-row items-center gap-x-2">
            <Avatar alt={member.user.id} className="h-10 w-10">
              <AvatarImage source={{ uri: member.user.image }} />
              <AvatarFallback></AvatarFallback>
            </Avatar>
            <Text
              key={member.user_id}
              className="text-foreground font-Geist_Medium"
            >
              {member.user.name ? member.user.name : "Unknown User"}
            </Text>
            <Text
              key={member.user_id + "-role"}
              className="text-foreground font-Geist_Medium"
            >
              {"("}
              {member.user.role ? member.user.role : "Unknown Role"}
              {")"}
            </Text>
          </View>
        ))} */}
      </View>
    </View>
  );
};

export default Tab1;
