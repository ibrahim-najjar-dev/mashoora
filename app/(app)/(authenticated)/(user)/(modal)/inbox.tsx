import { Search } from "lucide-react-native";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import Icons from "~/components/ui/icons";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";

const Inbox = () => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-1">
      <View className="pt-5 px-5">
        <View className="relative flex-row items-center">
          <TextInput
            // ref={inputRef}
            placeholder="Search"
            placeholderTextColor="#787878"
            className="bg-neutral-900 text-neutral-200 pl-10 pr-3 rounded-xl text-base/5 h-10 flex-1"
            // style={styles.input}

            selectionColor="#e5e5e5"
            // onPress={onGoToCommands}
          />
          <View className="absolute left-3">
            <Search size={16} color="#787878" />
          </View>
        </View>
      </View>
      <ScrollView className="mt-5 px-3">
        <Text className="text-muted-foreground mb-3 font-Geist_Medium">
          Pinned [3]
        </Text>
        <TouchableOpacity className="flex-row items-center gap-x-3 p-3">
          <View>
            <View className="h-10 w-10 rounded-full bg-neutral-200" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-x-2 justify-between">
              <Text className="text-foreground text-lg">
                Ali from barcelona
              </Text>
              <Text className="text-muted-foreground text-sm">2 mins</Text>
            </View>
            <View className="flex-row items-center justify-between gap-x-2">
              <Text className="text-muted-foreground text-sm line-clamp-1 max-w-[80%]">
                Hi, I am Ali from Barcelona. How can I help you today?
              </Text>
              <View className="flex-row items-center gap-x-1 ">
                <Icons.SolarShieldWarningBold
                  height={16}
                  width={16}
                  color="#eab308"
                />
                <Icons.SolarUserRoundedBold
                  height={16}
                  width={16}
                  color="#22c55e"
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Inbox;
