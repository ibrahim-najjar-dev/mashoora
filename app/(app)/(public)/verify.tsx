import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import {
  AlertCircle,
  Loader,
  RefreshCcw,
  Shield,
  Trash,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { OtpInput } from "~/components/verify/otp-input";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";

const OtpInputExample: React.FC = () => {
  const [otpValue, setOtpValue] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const { colorScheme } = useColorScheme();

  const handleOtpChange = (code: string): void => {
    setOtpValue(code);
    if (hasError) {
      setHasError(false);
    }
  };

  const handleOtpFinished = async (code: string): Promise<void> => {
    setIsVerifying(true);

    setTimeout(() => {
      if (code === "1234") {
        setIsSuccess(true);
        setHasError(false);
        Alert.alert("Success", "OTP verified successfully!");
      } else {
        setHasError(true);
        setIsSuccess(false);
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handleResendCode = (): void => {
    setOtpValue("");
    setHasError(false);
    setIsSuccess(false);
    Alert.alert(
      "Code Sent",
      "A new verification code has been sent to your device."
    );
  };

  const clearOtp = (): void => {
    setOtpValue("");
    setHasError(false);
    setIsSuccess(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-background justify-center items-center p-5">
        <Card className="elevation-xl shadow-sm justify-center items-center p-8 rounded-3xl w-full max-w-[400px] bg-secondary">
          {/* Header */}

          <CardHeader className="items-center">
            <View className="size-14 rounded-full bg-secondary justify-center items-center border border-border mb-4">
              <Shield size={24} color={NAV_THEME[colorScheme].primary} />
            </View>
            <CardTitle className="mb-2">Verify Your Identity</CardTitle>
            <Text className="text-base text-muted-foreground text-center">
              Enter the 4-digit code sent to your device
            </Text>
          </CardHeader>

          {/* OTP Input */}
          <CardContent className="my-6">
            <OtpInput
              otpCount={4}
              containerClassname="gap-3"
              otpInputStyle={[
                {
                  backgroundColor: NAV_THEME[colorScheme].background,
                  borderWidth: 1,
                  borderColor: NAV_THEME[colorScheme].border,
                  color: NAV_THEME[colorScheme].text,
                  fontSize: 24,
                  fontWeight: "600",
                  textAlign: "center",
                  shadowColor: NAV_THEME[colorScheme].background,
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                },
                hasError && {
                  borderColor: NAV_THEME[colorScheme].destructive,
                  backgroundColor: NAV_THEME[colorScheme].background,
                },
                isSuccess && {
                  borderColor: NAV_THEME[colorScheme].success,
                  backgroundColor: NAV_THEME[colorScheme].background,
                },
                ,
              ]}
              textStyle={[
                {
                  color: NAV_THEME[colorScheme].text,
                  fontSize: 24,

                  fontFamily: "font-Mono_SemiBold",
                },
              ]}
              focusedColor={
                hasError
                  ? NAV_THEME[colorScheme].destructive
                  : isSuccess
                    ? NAV_THEME[colorScheme].success
                    : NAV_THEME[colorScheme].primary
              }
              inputWidth={64}
              inputHeight={72}
              inputBorderRadius={12}
              enableAutoFocus={true}
              editable={!isVerifying && !isSuccess}
              onInputChange={handleOtpChange}
              onInputFinished={handleOtpFinished}
              error={hasError}
              errorMessage={
                hasError ? "Invalid code. Please try again." : undefined
              }
            />

            {/* Status Messages */}
            <View className="min-h-10 justify-center mb-3 flex-row">
              {isVerifying && (
                <View className="flex-row items-center justify-center gap-2 py-2 px-4 bg-background w-fit rounded-lg border border-border shaodw-sm">
                  <Loader
                    className="animate-spin"
                    size={16}
                    color={NAV_THEME[colorScheme].text}
                  />
                  <Text className="text-sm text-muted-foreground font-Geist_Regular">
                    Verifying code...
                  </Text>
                </View>
              )}

              {isSuccess && (
                <View className="flex-row items-center justify-center gap-2 py-2 px-4 bg-secondary w-fit rounded-lg border border-border shaodw-sm">
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={NAV_THEME[colorScheme].success}
                  />
                  <Text className="text-sm font-Geist_Regular text-foreground">
                    Verification successful!
                  </Text>
                </View>
              )}

              {hasError && (
                <View className="flex-row items-center justify-center gap-2 py-2 px-4 bg-destructive/80 w-fit rounded-lg border border-destructive">
                  <AlertCircle size={14} color={NAV_THEME[colorScheme].text} />
                  <Text className="text-sm font-Geist_Regular text-destructive-foreground">
                    Invalid code. Please try again.
                  </Text>
                </View>
              )}
            </View>
          </CardContent>

          {/* Action Buttons */}
          <CardFooter className="gap-x-4">
            <Button
              className="gap-2 flex-row items-center justify-center py-3 px-4 bg-secondary"
              onPress={handleResendCode}
              disabled={isVerifying}
              variant={"outline"}
            >
              <RefreshCcw size={16} color={NAV_THEME[colorScheme].muted} />
              <Text className="text-sm font-Geist_Regular text-muted-foreground">
                Resend Code
              </Text>
            </Button>

            <Button
              variant={"outline"}
              onPress={clearOtp}
              disabled={isVerifying}
              className="gap-2 flex-row items-center justify-center py-3 px-4 bg-secondary"
            >
              <Trash size={16} color={NAV_THEME[colorScheme].muted} />
              <Text className="text-sm font-Geist_Regular text-muted-foreground">
                Clear
              </Text>
            </Button>
          </CardFooter>

          {/* Helper Text */}
          <Text className="text-sm font-Mono_Regular text-center text-muted-foreground">
            Didnt receive a code? Check your spam folder or try again in 60
            seconds.
          </Text>
        </Card>
        <Link className="mt-4" href={"/(app)/(authenticated)/(user)/(tabs)"}>
          <Text className="text-foreground font-Mono_Medium">test login</Text>
        </Link>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default OtpInputExample;

const styles = StyleSheet.create({
  otpTextStyle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "600",
  },
});
