import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { ArrowRight, HandHeart } from "lucide-react-native";
import { Text, TouchableWithoutFeedback, Keyboard, View } from "react-native";
import { Button } from "~/components/ui/button";
import { CardContent, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  AuthCard,
  AuthHeader,
  PhoneNumberInput,
  OtpVerification,
} from "~/components/auth";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { useAuthForm } from "~/hooks/use-auth-form";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const {
    selectedCountry,
    phoneNumber,
    firstName,
    lastName,
    code,
    pendingVerification,
    isVerifying,
    hasError,
    isSuccess,
    handlePhoneNumberChange,
    handleCountryChange,
    handleOtpChange,
    clearOtp,
    setFirstName,
    setLastName,
    setPendingVerification,
    setIsVerifying,
    setHasError,
    setIsSuccess,
    getFullPhoneNumber,
    showAlert,
  } = useAuthForm();

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        phoneNumber: getFullPhoneNumber(),
        firstName: firstName,
        lastName: lastName,
      });

      await signUp.preparePhoneNumberVerification({
        strategy: "phone_code",
      });

      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      showAlert("Error", "Failed to create account. Please try again.");
    }
  };

  const handleOtpFinished = async (code: string) => {
    setIsVerifying(true);
    try {
      await onVerifyPressWithCode(code);
    } finally {
      setIsVerifying(false);
    }
  };

  const onVerifyPressWithCode = async (otpCode: string) => {
    if (!isLoaded) return;
    try {
      const signUpAttempt = await signUp.attemptPhoneNumberVerification({
        code: otpCode,
      });

      if (signUpAttempt.status === "complete") {
        setIsSuccess(true);
        setHasError(false);
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        setHasError(true);
        setIsSuccess(false);
        showAlert("Verification", "Further steps required. Please try again.");
      }
    } catch (err) {
      setHasError(true);
      setIsSuccess(false);
      showAlert("Verification Failed", "Invalid code. Please try again.");
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const handleResendCode = async () => {
    clearOtp();
    if (!isLoaded) return;

    try {
      await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
      showAlert(
        "Code Sent",
        "A new verification code has been sent to your device."
      );
    } catch (err) {
      showAlert("Error", "Failed to resend code.");
    }
  };

  if (pendingVerification) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-background justify-center items-center p-3">
          <AuthCard className="justify-center">
            <OtpVerification
              code={code}
              isVerifying={isVerifying}
              hasError={hasError}
              isSuccess={isSuccess}
              onCodeChange={handleOtpChange}
              onCodeFinished={handleOtpFinished}
              onResendCode={handleResendCode}
              onClearCode={clearOtp}
              description="Enter the 6-digit code sent to your device"
            />
            <Link
              className="mt-4"
              href={"/(app)/(authenticated)/(user)/(tabs)"}
            >
              <Text className="text-foreground font-Mono_Medium">
                test login
              </Text>
            </Link>
          </AuthCard>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <AuthCard>
        <AuthHeader
          icon={<HandHeart size={24} color={"#60a5fa"} />}
          title="Sign up using phone number"
          description="Enter your details to create an account."
        />

        <CardContent className="my-6 w-full">
          <View className="flex-row items-center gap-x-3 h-12 w-full">
            <Input
              className="flex-1"
              placeholder="First"
              value={firstName}
              onChangeText={setFirstName}
            />
            <Input
              className="flex-1"
              placeholder="Last"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          <View className="w-full mt-2">
            <PhoneNumberInput
              phoneNumber={phoneNumber}
              selectedCountry={selectedCountry}
              onPhoneNumberChange={handlePhoneNumberChange}
              onCountryChange={handleCountryChange}
            />
          </View>
        </CardContent>

        <CardFooter className="gap-x-4">
          <Button
            className="gap-2 flex-row items-center justify-center py-3 px-4 bg-secondary flex-1"
            variant={"outline"}
            onPress={onSignUpPress}
            disabled={!phoneNumber || !firstName || !lastName}
          >
            <Text className="text-sm font-Geist_Regular text-muted-foreground">
              Continue
            </Text>
            <ArrowRight size={16} color={NAV_THEME[colorScheme].muted} />
          </Button>
        </CardFooter>

        <View className="flex-row items-center justify-center mt-4">
          <Text className="text-sm text-muted-foreground">
            Already have an account?
          </Text>
          <Button
            variant={"link"}
            className="ml-1"
            onPress={() => router.replace("/(app)/(public)/sign-in")}
          >
            <Text className="text-sm text-foreground underline">Sign In</Text>
          </Button>
        </View>
      </AuthCard>
    </TouchableWithoutFeedback>
  );
};

export default SignUp;
