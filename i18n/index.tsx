import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationAr from "~/i18n/locales/ar/translation.json";
import translationEn from "~/i18n/locales/en-us/translation.json";

const resources = {
  "en-US": { translation: translationEn },
  // arabic translations
  ar: {
    translation: translationAr,
  },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem("language");

  if (!savedLanguage) {
    savedLanguage = Localization.getLocales()[0].languageTag || "en-US";
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: savedLanguage,
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false,
    },
  });

  // Configura a direção do texto (LTR ou RTL)
  // I18nManager.allowRTL(false);
  // I18nManager.forceRTL(Localization.isRTL);
};

initI18n();

export default i18n;
