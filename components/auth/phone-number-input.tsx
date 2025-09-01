import { Text, View } from "react-native";
import PhoneInput, { ICountry } from "react-native-international-phone-number";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";

interface PhoneNumberInputProps {
  phoneNumber: string;
  selectedCountry: ICountry | null;
  onPhoneNumberChange: (phoneNumber: string) => void;
  onCountryChange: (country: ICountry) => void;
  defaultCountry?: string;
}

export const PhoneNumberInput = ({
  phoneNumber,
  selectedCountry,
  onPhoneNumberChange,
  onCountryChange,
  defaultCountry = "SA",
}: PhoneNumberInputProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <PhoneInput
      value={phoneNumber}
      onChangePhoneNumber={onPhoneNumberChange}
      selectedCountry={selectedCountry}
      onChangeSelectedCountry={onCountryChange}
      defaultCountry={defaultCountry as any}
      disableFullscreenUI
      theme="dark"
      modalStyles={{
        backdrop: {},
        content: {
          backgroundColor: NAV_THEME[colorScheme].background,
          borderRadius: 16,
          borderColor: NAV_THEME[colorScheme].border,
        },
        searchInput: {
          backgroundColor: NAV_THEME[colorScheme].background,
          color: NAV_THEME[colorScheme].text,
          borderColor: NAV_THEME[colorScheme].border,
        },
        list: {
          paddingTop: 0,
          paddingBottom: 0,
        },
        countryItem: {
          backgroundColor: NAV_THEME[colorScheme].secondary,
          borderColor: NAV_THEME[colorScheme].border,
        },
        searchContainer: {},
        countryName: {
          color: NAV_THEME[colorScheme].text,
        },
        callingCode: {
          color: NAV_THEME[colorScheme].text,
        },
      }}
      placeholder="Phone Number"
      phoneInputStyles={{
        container: {
          borderColor: NAV_THEME[colorScheme].border,
          backgroundColor: NAV_THEME[colorScheme].background,
          paddingRight: 0,
          paddingLeft: 0,
        },
        flagContainer: {
          backgroundColor: NAV_THEME[colorScheme].background,
          paddingRight: 10,
          paddingLeft: 10,
          marginRight: 0,
          marginLeft: 0,
        },
        flag: {
          backgroundColor: NAV_THEME[colorScheme].background,
        },
        input: {
          color: NAV_THEME[colorScheme].text,
          marginLeft: 0,
          marginRight: 0,
        },
        callingCode: {
          color: NAV_THEME[colorScheme].text,
          marginLeft: 0,
          marginRight: 0,
          backgroundColor: NAV_THEME[colorScheme].background,
        },
        caret: {
          color: NAV_THEME[colorScheme].text,
        },
        divider: {
          backgroundColor: NAV_THEME[colorScheme].border,
          marginLeft: 10,
          marginRight: 10,
        },
      }}
      customCaret={() => <></>}
      placeholderTextColor={NAV_THEME[colorScheme].muted}
      phoneInputPlaceholderTextColor={NAV_THEME[colorScheme].muted}
      modalType="popup"
    />
  );
};
