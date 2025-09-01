import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, View } from "react-native";
import CardsCarousel, { CarouselItem } from "~/components/carousel";
import Icons from "~/components/ui/icons"; // Assuming you have an Icons component for icons
import { Text } from "~/components/ui/text";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";

const ICON_SIZE = 40; // Define a constant for icon size

const carouselData: CarouselItem[] = [
  {
    id: 1,
    title: "Card 1",
    description: "Description for Card 1",
    icon: (
      <Icons.SolarHandMoneyBoldDuotone width={ICON_SIZE} height={ICON_SIZE} />
    ),
  },
  {
    id: 2,
    title: "Card 2",
    description: "Description for Card 2",
    icon: (
      <Icons.SolarHandMoneyBoldDuotone width={ICON_SIZE} height={ICON_SIZE} />
    ),
  },
  {
    id: 3,
    title: "Card 3",
    description: "Description for Card 3",
    icon: (
      <Icons.SolarHandMoneyBoldDuotone width={ICON_SIZE} height={ICON_SIZE} />
    ),
  },
];

// Sample client data - including enough for multiple grid pages
const clientsData = [
  { id: 1, name: "Client 1" },
  { id: 2, name: "Client 2" },
  { id: 3, name: "Client 3" },
  { id: 4, name: "Client 4" },
  { id: 5, name: "Client 5" },
  { id: 6, name: "Client 6" },
  { id: 7, name: "Client 7" },
  { id: 8, name: "Client 8" },
  { id: 9, name: "Client 9" },
  { id: 10, name: "Client 10" },
  { id: 11, name: "Client 11" },
];

const Index = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View className="flex-1">
      <ScrollView className="py-4">
        <CardsCarousel data={carouselData} />

        <View className="flex-1 items-center justify-center mt-4">
          <View className="flex-row items-center flex-1 px-6 w-full gap-2">
            <Icons.SolarUserCheckRoundedBoldDuotone
              width={24}
              height={24}
              color={NAV_THEME[colorScheme].text}
            />
            <Text className="text-lg font-Geist_SemiBold">Statistics</Text>
          </View>
          <View className="flex-row mt-2 gap-4 px-6">
            <Pressable className="flex-1 h-52 rounded-2xl border border-border overflow-hidden">
              <View className="w-full h-full px-4 py-4 flex justify-between flex-1">
                <View className="flex-row items-center gap-x-2">
                  <Icons.SolarHandStarsBoldDuotone
                    width={24}
                    height={24}
                    color={NAV_THEME[colorScheme].muted}
                  />
                  <Text className="text-foreground text-lg font-Geist_SemiBold">
                    Ratings
                  </Text>
                </View>
                <View>
                  <View className="flex-row items-center gap-x-2">
                    <Text className="text-foreground text-3xl font-Geist_SemiBold">
                      4.8
                    </Text>
                    <View className="mb-auto flex items-center justify-center">
                      <Text className="text-muted-foreground text-sm font-Geist_Medium">
                        (120)
                      </Text>
                    </View>
                  </View>
                  <View className="rounded-lg overflow-hidden bg-secondary flex-row items-center h-2 w-full mt-2">
                    <View
                      className="h-full bg-sky-200 border-r-4 border-background"
                      style={{ width: "45%" }}
                    />
                    <View
                      className="h-full bg-sky-300 border-r-4 border-background"
                      style={{ width: "20%" }}
                    />
                    <View
                      className="h-full bg-sky-400 border-r-4 border-background"
                      style={{ width: "10%" }}
                    />
                    <View
                      className="h-full bg-sky-500 border-r-4 border-background"
                      style={{ width: "11%" }}
                    />
                    <View
                      className="h-full bg-sky-600"
                      style={{ width: "14%" }}
                    />
                  </View>
                </View>
              </View>
            </Pressable>
            <Pressable className="flex-1 h-52 rounded-2xl border border-transparent overflow-hidden">
              <LinearGradient colors={["#87CEFA", "#00BFFF"]}>
                <View className="w-full h-full px-4 py-4">
                  <View className="flex-row items-center gap-x-2">
                    <Icons.SolarHandMoneyBoldDuotone
                      width={24}
                      height={24}
                      color={NAV_THEME[colorScheme].background}
                    />
                    <Text className="text-background text-lg font-Geist_SemiBold">
                      Earnings
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
            {/* <Pressable className="flex-1 h-52 rounded-xl border border-border" /> */}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Index;
