import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { I18nManager } from "react-native";

export function useRTL() {
  const { i18n } = useTranslation();

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    // Force RTL layout when Arabic is selected
    if (isRTL !== I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(isRTL);
      // Note: On some platforms, you might need to reload the app for this to take effect
      // This is more relevant for production builds
    }
  }, [isRTL]);

  return { isRTL };
}
