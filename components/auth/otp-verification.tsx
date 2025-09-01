import {
  AlertCircle,
  Loader,
  RefreshCcw,
  Shield,
  Trash,
} from "lucide-react-native";
import { Text, View } from "react-native";
import { Button } from "~/components/ui/button";
import { CardContent, CardFooter } from "~/components/ui/card";
import { OtpInput } from "~/components/verify/otp-input";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { AuthHeader } from "./auth-header";

interface OtpVerificationProps {
  code: string;
  isVerifying: boolean;
  hasError: boolean;
  isSuccess: boolean;
  onCodeChange: (code: string) => void;
  onCodeFinished: (code: string) => void;
  onResendCode: () => void;
  onClearCode: () => void;
  otpCount?: number;
  title?: string;
  description?: string;
}

export const OtpVerification = ({
  code,
  isVerifying,
  hasError,
  isSuccess,
  onCodeChange,
  onCodeFinished,
  onResendCode,
  onClearCode,
  otpCount = 6,
  title = "Verify Your Identity",
  description = "Enter the 6-digit code sent to your device",
}: OtpVerificationProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <>
      <AuthHeader
        icon={<Shield size={24} color={NAV_THEME[colorScheme].primary} />}
        title={title}
        description={description}
      />

      <CardContent className="my-6">
        <OtpInput
          otpCount={otpCount}
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
              shadowOffset: { width: 0, height: 2 },
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
          inputWidth={50}
          inputHeight={64}
          inputBorderRadius={12}
          enableAutoFocus={true}
          editable={!isVerifying && !isSuccess}
          onInputChange={onCodeChange}
          onInputFinished={onCodeFinished}
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
              <Text
                style={{
                  color: NAV_THEME[colorScheme].success,
                  fontSize: 16,
                }}
              >
                ✔
              </Text>
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

      <CardFooter className="gap-x-4">
        <Button
          className="gap-2 flex-row items-center justify-center py-3 px-4 bg-secondary"
          onPress={onResendCode}
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
          onPress={onClearCode}
          disabled={isVerifying}
          className="gap-2 flex-row items-center justify-center py-3 px-4 bg-secondary"
        >
          <Trash size={16} color={NAV_THEME[colorScheme].muted} />
          <Text className="text-sm font-Geist_Regular text-muted-foreground">
            Clear
          </Text>
        </Button>
      </CardFooter>

      <Text className="text-sm font-Mono_Regular text-center text-muted-foreground">
        Didn&apos;t receive a code? Check your spam folder or try again in 60
        seconds.
      </Text>
    </>
  );
};
