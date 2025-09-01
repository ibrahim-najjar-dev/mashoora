import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { LangaugeCodeType, Languages } from "~/constants/Languages";
import * as Form from "~/components/ui/form";
import Icons from "~/components/ui/icons";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";

const LangaugeSelector = () => {
  const { colorScheme } = useColorScheme();

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
    <View className="flex-1">
      <Form.List className="bg-background">
        <Form.Section>
          {Languages.map((lang) => (
            <Form.FormItem
              // hint={i18n.language === lang.code ? "Current Language" : ""}

              key={lang.code}
              onPress={() => changeLanguage(lang.code)}
            >
              <Form.Text>{lang.code}</Form.Text>
              <View className="flex-1" />
              {i18n.language === lang.code && (
                <Icons.SolarCheckSquareBold
                  height={20}
                  width={20}
                  color={NAV_THEME[colorScheme].primary}
                />
              )}
            </Form.FormItem>
          ))}
        </Form.Section>
      </Form.List>
    </View>
  );
};

export default LangaugeSelector;
