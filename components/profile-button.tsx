import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { FC } from "react";
import { Pressable, StyleSheet, View, Platform } from "react-native";

import { NAV_THEME } from "~/constants/Colors";
import { SETTINGS_CONTAINER_WIDTH } from "~/lib/home-animation-provider";
import { useColorScheme } from "~/lib/useColorScheme";

import * as DropdownMenu from "zeego/dropdown-menu";
import { Text } from "./ui/text";
import Icons from "./ui/icons";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

// raycast-home-search-transition-animation 🔽

export const ProfileButton: FC = () => {
  const router = useRouter();

  const { colorScheme } = useColorScheme();

  const { userId } = useAuth();

  const user = useQuery(api.user.getUserByClerkId, {
    clerkUserId: userId!,
  });

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Pressable
          className="items-center justify-center"
          style={styles.imageContainer}
        >
          <Avatar alt="profile image">
            <AvatarImage source={{ uri: user?.imageUrl }} />
            <AvatarFallback></AvatarFallback>
          </Avatar>
        </Pressable>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content sideOffset={-20}>
        <DropdownMenu.Label>My Account</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item
            key="profile"
            onSelect={() => console.log("My profile selected")}
          >
            <DropdownMenu.ItemIcon
              ios={{ name: "person.circle" }}
              androidIconName="account_circle"
            >
              <Image
                placeholder={{ blurhash: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH" }}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "white",
                }}
              />
            </DropdownMenu.ItemIcon>
            <DropdownMenu.ItemTitle>My profile</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            key="inbox"
            onSelect={() => console.log("Inbox selected")}
          >
            <DropdownMenu.ItemIcon
              ios={{ name: "tray" }}
              androidIconName="inbox"
            >
              <Icons.SolarInboxBoldDuotone
                height={20}
                width={20}
                color={NAV_THEME[colorScheme].text}
              />
            </DropdownMenu.ItemIcon>
            <DropdownMenu.ItemTitle>Inbox</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            key="favorites"
            onSelect={() => console.log("Favorites selected")}
          >
            <DropdownMenu.ItemIcon
              ios={{ name: "heart" }}
              androidIconName="favorite"
            >
              <Icons.SolarHeartsBoldDuotone
                height={20}
                width={20}
                color={NAV_THEME[colorScheme].text}
              />
            </DropdownMenu.ItemIcon>
            <DropdownMenu.ItemTitle>Favorites</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Group>

        <DropdownMenu.Separator />

        <DropdownMenu.Item
          key="settings"
          onSelect={() => console.log("Settings selected")}
        >
          <DropdownMenu.ItemIcon
            ios={{ name: "gear" }}
            androidIconName="settings"
          >
            <Icons.SolarSettingsBoldDuotone
              height={20}
              width={20}
              color={NAV_THEME[colorScheme].text}
            />
          </DropdownMenu.ItemIcon>
          <DropdownMenu.ItemTitle>Settings</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>

        <DropdownMenu.Item
          key="help"
          onSelect={() => console.log("Help & Support selected")}
        >
          <DropdownMenu.ItemIcon
            ios={{ name: "questionmark.circle" }}
            androidIconName="help"
          >
            <Icons.SolarHelpBoldDuotone
              height={20}
              width={20}
              color={NAV_THEME[colorScheme].text}
            />
          </DropdownMenu.ItemIcon>
          <DropdownMenu.ItemTitle>Help & Support</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <DropdownMenu.Item
          key="logout"
          onSelect={() => console.log("Logout selected")}
        >
          <DropdownMenu.ItemIcon
            ios={{ name: "rectangle.portrait.and.arrow.right" }}
            androidIconName="exit_to_app"
          >
            <Icons.SolarExitBoldDuotone
              height={20}
              width={20}
              color={NAV_THEME[colorScheme].text}
            />
          </DropdownMenu.ItemIcon>
          <DropdownMenu.ItemTitle>Logout</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
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
