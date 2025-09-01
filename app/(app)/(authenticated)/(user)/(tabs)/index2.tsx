import { StyleSheet, TouchableOpacity } from "react-native";

import { Link } from "expo-router";
import { CalendarClock, Camera } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import LangaugeSelector from "~/components/langauge-selector";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { View } from "~/components/ui/view";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";

const HomeScreen = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  console.log(colorScheme);

  const { t } = useTranslation();

  return (
    <View>
      <Link href={"/(app)/(public)/verify"}>
        <Text>verify</Text>
      </Link>
      <Link href={"/(app)/(authenticated)/(user)/(modal)/split"}>
        <Text>splitPanel</Text>
      </Link>
      <Link href={"/(app)/(authenticated)/(user)/(modal)/availability-screen"}>
        <Text>availaibiliy</Text>
      </Link>
      <Card>
        <CardHeader className="flex-row gap-x-2">
          <Badge variant={"ghost"}>
            <View className="flex-row items-center gap-x-1">
              <CalendarClock size={12} color={NAV_THEME[colorScheme].muted} />
              <Text>30 Mar 10:00</Text>
            </View>
          </Badge>

          <Badge className="w-auto bg-indigo-300">
            <Text className="text-indigo-600">
              <Camera size={14} color={NAV_THEME[colorScheme].muted} />
            </Text>
          </Badge>
        </CardHeader>
        <CardContent>
          <Text className="text-xl font-Geist_SemiBold">
            Immigration Services Consultation Appointment
          </Text>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
      <Text className="text-foreground">{t("home.title")}</Text>
      <TouchableOpacity
        onPress={() => {
          toggleColorScheme();
        }}
      >
        <Text className="text-foreground text-2xl font-semibold">
          Toggle Theme
        </Text>
      </TouchableOpacity>
      <Text className="text-muted-foreground font-Mono_Regular">MonoText</Text>

      <LangaugeSelector />
      {/* <View className="h-[800px]"></View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
