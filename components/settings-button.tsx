import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { FC } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { NAV_THEME } from "~/constants/Colors";
import { SETTINGS_CONTAINER_WIDTH } from "~/lib/home-animation-provider";
import { useColorScheme } from "~/lib/useColorScheme";
import Icons from "./ui/icons";
import { Text } from "./ui/text";

// raycast-home-search-transition-animation 🔽

export const SettingsButton: FC = () => {
  const router = useRouter();

  const contentInsets = {
    top: -100,
    left: 20,
    right: 0,
    bottom: 0,
  };

  const { colorScheme } = useColorScheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          // onPress={() => {
          //   router.push("/(app)/(authenticated)/(user)/(modal)/inbox");
          // }}
          className="items-center justify-center"
          style={styles.imageContainer}
        >
          <Image
            placeholder={{ blurhash: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH" }}
            style={styles.image}
          />
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={14}
        insets={{
          right: 14,
        }}
        className="w-64 native:w-72 overflow-hidden p-0 border-white/10 rounded-3xl"
        style={{ backgroundColor: "transparent", borderCurve: "continuous" }}
      >
        <BlurView
          intensity={90}
          tint="dark"
          className="rounded-md overflow-hidden"
        >
          <View className="p-1">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuGroup>
              <CustomDropdownMenuItem
                text="My profile"
                icon={
                  <Image
                    placeholder={{ blurhash: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH" }}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: "white",
                    }}
                  />
                }
              />
              <CustomDropdownMenuItem
                text="Inbox"
                icon={
                  <Icons.SolarInboxBoldDuotone
                    height={20}
                    width={20}
                    color={NAV_THEME[colorScheme].text}
                  />
                }
              >
                <DropdownMenuShortcut>99+</DropdownMenuShortcut>
              </CustomDropdownMenuItem>
              <CustomDropdownMenuItem
                text="Favorites"
                icon={
                  <Icons.SolarHeartsBoldDuotone
                    height={20}
                    width={20}
                    color={NAV_THEME[colorScheme].text}
                  />
                }
              >
                <DropdownMenuShortcut></DropdownMenuShortcut>
              </CustomDropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="active:bg-primary/10 rounded-md">
              <Icons.SolarSettingsBoldDuotone
                height={20}
                width={20}
                color={NAV_THEME[colorScheme].text}
              />
              <Text className="text-sm font-Geist_Medium text-foreground">
                Settings
              </Text>
            </DropdownMenuItem>
            <CustomDropdownMenuItem
              text="Help & Support"
              icon={
                <Icons.SolarHelpBoldDuotone
                  height={20}
                  width={20}
                  color={NAV_THEME[colorScheme].text}
                />
              }
            />

            <DropdownMenuSeparator />
            <CustomDropdownMenuItem
              text="Logout"
              icon={
                <Icons.SolarExitBoldDuotone
                  height={20}
                  width={20}
                  color={NAV_THEME[colorScheme].text}
                />
              }
            />
          </View>
        </BlurView>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CustomDropdownMenuItem: FC<{
  children?: React.ReactNode;
  text: string;
  icon: React.ReactNode;
}> = ({ children, text, icon }) => {
  return (
    <Link asChild href={"/(app)/(authenticated)/(user)/(modal)/settings"}>
      <DropdownMenuItem className="active:bg-primary/10 rounded-md">
        {icon}
        <Text className="text-sm font-Geist_Medium text-foreground">
          {text}
        </Text>
        {children}
      </DropdownMenuItem>
    </Link>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: SETTINGS_CONTAINER_WIDTH,
  },
  image: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "white",
  },
});

// raycast-home-search-transition-animation 🔼
