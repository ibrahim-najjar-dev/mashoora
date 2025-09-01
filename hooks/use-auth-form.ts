import { useState } from "react";
import { Alert } from "react-native";
import { ICountry } from "react-native-international-phone-number";

export interface UseAuthFormOptions {
  onSuccess?: () => void;
  onVerificationPending?: () => void;
}

export const useAuthForm = (options: UseAuthFormOptions = {}) => {
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // OTP state
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePhoneNumberChange = (phoneNumber: string) => {
    setPhoneNumber(phoneNumber);
  };

  const handleCountryChange = (country: ICountry) => {
    setSelectedCountry(country);
  };

  const handleOtpChange = (code: string) => {
    setCode(code);
    if (hasError) setHasError(false);
  };

  const clearOtp = () => {
    setCode("");
    setHasError(false);
    setIsSuccess(false);
  };

  const resetForm = () => {
    setPhoneNumber("");
    setFirstName("");
    setLastName("");
    setCode("");
    setPendingVerification(false);
    setIsVerifying(false);
    setHasError(false);
    setIsSuccess(false);
  };

  const getFullPhoneNumber = () => {
    return selectedCountry?.idd.root + phoneNumber;
  };

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  return {
    // Form state
    selectedCountry,
    phoneNumber,
    firstName,
    lastName,
    code,
    pendingVerification,

    // OTP state
    isVerifying,
    hasError,
    isSuccess,

    // Handlers
    handlePhoneNumberChange,
    handleCountryChange,
    handleOtpChange,
    clearOtp,
    resetForm,

    // Setters
    setSelectedCountry,
    setPhoneNumber,
    setFirstName,
    setLastName,
    setCode,
    setPendingVerification,
    setIsVerifying,
    setHasError,
    setIsSuccess,

    // Utils
    getFullPhoneNumber,
    showAlert,
  };
};
