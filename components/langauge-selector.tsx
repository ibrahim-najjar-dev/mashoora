import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import { LangaugeCodeType, Languages } from "~/constants/Languages";
import { View } from "./ui/view";

const LangaugeSelector = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage) {
        i18n.changeLanguage(savedLanguage);
      }
    };
    loadLanguage();
  }, [i18n]);

  const changeLanguage = async (lang: LangaugeCodeType) => {
    await AsyncStorage.setItem("language", lang);
    i18n.changeLanguage(lang);
  };

  return (
    <View className="flex-row items-center gap-x-3">
      {Languages.map((language) => (
        <TouchableOpacity
          key={language.code}
          onPress={() => changeLanguage(language.code)}
        >
          <Image
            source={
              language.code === "en-US"
                ? require("~/assets/flags/en.svg")
                : require("~/assets/flags/ar.svg")
            }
            style={{ width: 25, height: 25 }}
          />
          {/* <Text>{language.label}</Text> */}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default LangaugeSelector;
