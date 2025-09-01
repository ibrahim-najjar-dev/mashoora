import React, { useState } from "react";
import { Text, View } from "react-native";
import {
  StepScreenContent,
  StepScreenActions,
  StepScreenWrapper,
} from "~/app/(app)/(authenticated)/on-boarding";
import Icons from "../ui/icons";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/constants/Colors";
import { Button } from "../ui/button";
import { useRouter } from "expo-router";
import { useCurrentUserRole } from "~/lib/auth";
import { useAction, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";

interface CompletionScreenProps {
  onComplete?: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ onComplete }) => {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const userRole = useCurrentUserRole();
  const [isCompleting, setIsCompleting] = useState(false);

  const completeOnboarding = useAction(api.user.completeOnboarding);

  const handleGetStarted = async () => {
    try {
      setIsCompleting(true);

      // Mark onboarding as complete in the database
      await completeOnboarding({});

      if (onComplete) {
        onComplete();
      } else {
        console.log("Onboarding complete");
        // refresh page
        if (userRole === "consultant") {
          router.replace("/(app)/(authenticated)/(consultant)/(tabs)");
        } else {
          router.replace("/(app)/(authenticated)/(user)/(tabs)");
        }
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // You could add a toast notification here
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <StepScreenWrapper>
      <StepScreenContent>
        <View className="flex-1 justify-center items-center px-6">
          {/* Success checkmark */}
          <View className="w-24 h-24 rounded-full bg-green-500/10 justify-center items-center mb-8">
            <View className="w-16 h-16 rounded-full bg-green-500 justify-center items-center">
              <Icons.SolarUserCheckRoundedBoldDuotone
                width={32}
                height={32}
                color="#ffffff"
              />
            </View>
          </View>

          {/* Success message */}
          <Text className="text-3xl font-bold text-foreground mb-3 text-center">
            🎉 All Set!
          </Text>

          <Text className="text-lg text-muted-foreground text-center mb-8 px-4 leading-relaxed">
            {userRole === "consultant"
              ? "Welcome to Mashoora! You're ready to start helping clients and sharing your expertise."
              : "Welcome to Mashoora! You're ready to find the perfect consultants for your needs."}
          </Text>
        </View>
      </StepScreenContent>

      <StepScreenActions>
        <Button
          className="flex-1 rounded-xl bg-primary"
          size="lg"
          disabled={isCompleting}
          onPress={handleGetStarted}
        >
          <Text className="text-xl text-primary-foreground font-semibold">
            {isCompleting ? "Setting up..." : "Get Started"}
          </Text>
        </Button>
      </StepScreenActions>
    </StepScreenWrapper>
  );
};

export default CompletionScreen;
