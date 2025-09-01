import { useTranslation } from "react-i18next";

/**
 * Utility function to get localized text based on current language
 * Returns Arabic text if available and current language is Arabic, otherwise returns the default text
 *
 * @param defaultText - The default text (usually in English)
 * @param arabicText - The Arabic text (optional)
 * @returns The appropriate text based on current language and availability
 */
export const useLocalizedText = (
  defaultText: string,
  arabicText?: string
): string => {
  const { i18n } = useTranslation();

  const isArabic = i18n.language === "ar";
  const hasArabicText = arabicText && arabicText.trim() !== "";

  return isArabic && hasArabicText ? arabicText : defaultText;
};

/**
 * Non-hook version for use outside of React components
 * Requires passing the current language code
 *
 * @param defaultText - The default text (usually in English)
 * @param arabicText - The Arabic text (optional)
 * @param currentLanguage - The current language code
 * @returns The appropriate text based on language and availability
 */
export const getLocalizedText = (
  defaultText: string,
  arabicText?: string,
  currentLanguage?: string
): string => {
  const isArabic = currentLanguage === "ar";
  const hasArabicText = arabicText && arabicText.trim() !== "";

  return isArabic && hasArabicText ? arabicText : defaultText;
};

/**
 * Hook version for objects with name and name_ar properties
 * Common pattern for database objects that have both English and Arabic names
 *
 * @param item - Object with name and optional name_ar properties
 * @returns The appropriate name based on current language and availability
 */
export const useLocalizedName = <T extends { name: string; name_ar?: string }>(
  item: T
): string => {
  return useLocalizedText(item.name, item.name_ar);
};

/**
 * Non-hook version for objects with name and name_ar properties
 *
 * @param item - Object with name and optional name_ar properties
 * @param currentLanguage - The current language code
 * @returns The appropriate name based on language and availability
 */
export const getLocalizedName = <T extends { name: string; name_ar?: string }>(
  item: T,
  currentLanguage?: string
): string => {
  return getLocalizedText(item.name, item.name_ar, currentLanguage);
};
