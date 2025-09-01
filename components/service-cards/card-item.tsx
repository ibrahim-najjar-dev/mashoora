import { Link } from "expo-router";
import { Pressable, View, StyleSheet } from "react-native";
import Icons from "../ui/icons";
import { Badge } from "../ui/badge";
import { Image } from "../ui/img";
import { Doc } from "~/convex/_generated/dataModel";
import { ITEM_HEIGHT } from "./service-card-item";
import { Text } from "../ui/text";
import * as ContextMenu from "zeego/context-menu";
import { EnhancedService } from "~/types/enhanced-services";

const CardItem = ({ service }: { service: EnhancedService }) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Link
          href={`/(app)/(authenticated)/(user)/(modal)/service/${service._id}`}
          asChild
        >
          <Pressable className="flex-1 p-2 flex-row gap-2 bg-secondary rounded-3xl border border-neutral-700/15">
            <View className="py-2 px-2 gap-3 items-centter justify-between">
              <View className="w-10 h-10 bg-rose-500 rounded-xl items-center justify-center">
                <Icons.SolarUserCircleBoldDuotone
                  height={24}
                  width={24}
                  color="#fff"
                />
              </View>
              <View className="flex-col items-center gap-1">
                <Icons.SolarStarBold height={20} width={20} color="#fbbf24" />
                <Text className="text-xs text-center font-Mono_SemiBold"></Text>
              </View>
              {/* <View className="w-8 h-3 rounded-full bg-neutral-700" /> */}
            </View>
            <View
              className="flex-1 bg-neutral-900/50 rounded-2xl px-3 py-2 items-stretch"
              style={styles.imageContainer}
            >
              <View className="flex-1">
                <View>
                  <Text className="text-lg font-Geist_Medium">
                    {service.name}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2 mt-1 flex-wrap">
                  <Badge
                    variant={"outline"}
                    className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                  >
                    <View
                      style={{
                        height: 14,
                        width: 14,
                        borderRadius: 4,
                      }}
                      className="items-center justify-center bg-rose-500"
                    >
                      <Icons.SolarHeartPulseBoldDuotone
                        height={12}
                        width={12}
                        color="#fff"
                      />
                    </View>
                    <Text className="text-xs">{service.category?.name}</Text>
                  </Badge>
                  <Badge
                    variant={"outline"}
                    className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                  >
                    <Icons.SolarVideocameraRecordBold
                      height={12}
                      width={12}
                      color="#f43f5e"
                    />

                    <Text className="text-xs">234234 min</Text>
                  </Badge>
                  <Badge
                    variant={"outline"}
                    className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                  >
                    <Icons.SolarMedalRibbonsStarBoldDuotone
                      height={12}
                      width={12}
                      color="#fff"
                    />

                    <Text className="text-xs">+5 years</Text>
                  </Badge>
                  <Badge
                    variant={"outline"}
                    className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                  >
                    <Icons.SolarUserSpeakRoundedBoldDuotone
                      height={12}
                      width={12}
                      color="#fff"
                    />

                    <Text className="text-xs">Arabic, English</Text>
                  </Badge>
                </View>
              </View>
              <View className="flex-row justify-between items-end">
                <View className="flex-1">
                  {/* nearest available appointment */}
                  <View>
                    <Text className="text-xs text-muted-foreground font-Geist_Regular">
                      Available Today
                    </Text>
                  </View>
                </View>
                {/* price */}
                <View className="flex-row items-center gap-x-1.5">
                  <Image
                    source={require("~/assets/images/sar_symbol.svg")}
                    style={{ width: 16, height: 16, tintColor: "white" }}
                  />
                  <Text className="font-Mono_SemiBold text-base">100</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Link>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        {/* <ContextMenu.Preview>{() => <Preview />}</ContextMenu.Preview> */}
        <ContextMenu.Label />
        <ContextMenu.Item
          key="item-1"
          onSelect={() => console.log("item-1 selected")}
        >
          <ContextMenu.ItemTitle>Item Title</ContextMenu.ItemTitle>
        </ContextMenu.Item>

        <ContextMenu.Separator />
        <ContextMenu.Arrow />
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    borderCurve: "continuous",
  },
  imageContainer: {
    borderCurve: "continuous",
  },
});

export default CardItem;
