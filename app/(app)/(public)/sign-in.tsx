import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { ArrowRight, Phone } from "lucide-react-native";
import { Text, TouchableWithoutFeedback, Keyboard, View } from "react-native";
import { Button } from "~/components/ui/button";
import { CardContent, CardFooter } from "~/components/ui/card";
import {
  AuthCard,
  AuthHeader,
  PhoneNumberInput,
  OtpVerification,
} from "~/components/auth";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { useAuthForm } from "~/hooks/use-auth-form";

const SignIn = () => {
  const { setActive, isLoaded, signIn } = useSignIn();
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const {
    selectedCountry,
    phoneNumber,
    code,
    pendingVerification,
    isVerifying,
    hasError,
    isSuccess,
    handlePhoneNumberChange,
    handleCountryChange,
    handleOtpChange,
    clearOtp,
    setPendingVerification,
    setIsVerifying,
    setHasError,
    setIsSuccess,
    getFullPhoneNumber,
    showAlert,
  } = useAuthForm();

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        strategy: "phone_code",
        identifier: getFullPhoneNumber(),
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(app)/(authenticated)/(user)/(tabs)");
      } else {
        setPendingVerification(true);
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      showAlert("Error", "Failed to send verification code. Please try again.");
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
      const signInAttempt = await signIn.attemptFirstFactor({
        strategy: "phone_code",
        code: otpCode,
      });

      if (signInAttempt.status === "complete") {
        setIsSuccess(true);
        setHasError(false);
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(app)/(authenticated)/(user)/(tabs)");
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
    if (!isLoaded || !signIn) return;

    try {
      await signIn.create({
        strategy: "phone_code",
        identifier: getFullPhoneNumber(),
      });
      showAlert(
        "Code Sent",
        "A new verification code has been sent to your device."
      );
    } catch (err: any) {
      console.error("Resend code error:", JSON.stringify(err, null, 2));
      if (err?.errors?.[0]?.code === "verification_already_verified") {
        showAlert(
          "Already Verified",
          "This phone number has already been verified. Please try signing in again."
        );
        setPendingVerification(false);
      } else {
        showAlert("Error", "Failed to resend code. Please try again.");
      }
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
          icon={<Phone size={24} color={NAV_THEME[colorScheme].primary} />}
          title="Sign in using phone number"
          description="Enter your phone number to receive a verification code."
        />

        <CardContent className="my-6 w-full">
          <View className="w-full">
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
            onPress={onSignInPress}
            disabled={!phoneNumber}
          >
            <Text className="text-sm font-Geist_Regular text-muted-foreground">
              Continue
            </Text>
            <ArrowRight size={16} color={NAV_THEME[colorScheme].muted} />
          </Button>
        </CardFooter>

        <View className="flex-row items-center justify-center mt-4">
          <Text className="text-sm text-muted-foreground">
            Don&apos;t have an account?
          </Text>
          <Button
            variant={"link"}
            className="ml-1"
            onPress={() => router.replace("/(app)/(public)/sign-up")}
          >
            <Text className="text-sm text-foreground underline">Sign Up</Text>
          </Button>
        </View>
      </AuthCard>
    </TouchableWithoutFeedback>
  );
};

export default SignIn;
