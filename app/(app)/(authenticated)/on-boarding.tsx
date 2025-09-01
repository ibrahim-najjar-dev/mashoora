import React, { ReactNode, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stepper } from "~/components/ui/stepper";
import { Button } from "~/components/ui/button";
import { SelectableCard } from "~/components/ui/selectable-card";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Camera,
  Users,
  UserCheck,
  Briefcase,
  HelpCircle,
} from "lucide-react-native";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useAction, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import {
  List,
  Section,
  TextField,
  FormItem,
  Text as FormText,
} from "~/components/ui/form";
import Icons from "~/components/ui/icons";
import { Roles } from "~/types/globals";
import WelcomeScreen from "~/components/on-boarding/welcome-screen";
import { useCurrentUserRole } from "~/lib/auth";
import * as ImagePicker from "expo-image-picker";
import SetupProfile from "~/components/on-boarding/setup-profile";
import Preferences from "~/components/on-boarding/preferences";
import CompletionScreen from "~/components/on-boarding/completion-screen";

const OnBoarding = () => {
  const { colorScheme } = useColorScheme();
  const [currentStep, setCurrentStep] = useState(0);

  const { userId } = useAuth();
  const { user: ClerkUser } = useUser();
  const userRole = useCurrentUserRole();

  // Skip welcome screen (step 0) if user has a role
  useEffect(() => {
    if (userRole && currentStep === 0) {
      setCurrentStep(1);
    }
  }, [userRole, currentStep]);

  const steps = ["Welcome", "Profile", "Preferences", "Complete"];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      // If user has a role, don't allow going back to step 0 (welcome screen)
      const minStep = userRole ? 1 : 0;
      if (currentStep > minStep) {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen handleNextStep={handleNext} />;
      case 1:
        return <SetupProfile user={ClerkUser} handleNextStep={handleNext} />;
      case 2:
        return <Preferences handleNextStep={handleNext} />;
      case 3:
        return <CompletionScreen />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Stepper at the top */}
      <View className="px-4 pt-4 pb-2">
        <Stepper steps={steps} currentStep={currentStep} showLabels={false} />
      </View>

      {/* Step content */}
      <View className="flex-1">{renderStepContent()}</View>
    </SafeAreaView>
  );
};

export const StepScreenHeader = ({
  title,
  icon,
}: {
  title: string;
  icon: ReactNode;
}) => {
  return (
    <View className="px-6 pt-4 flex-row items-center gap-3">
      {icon}
      <Text className="text-2xl font-bold text-foreground">{title}</Text>
    </View>
  );
};

export const StepScreenWrapper = ({ children }: { children: ReactNode }) => {
  return <View className="flex-1">{children}</View>;
};

export const StepScreenContent = ({ children }: { children: ReactNode }) => {
  return <View className="flex-1 px-6">{children}</View>;
};

export const StepScreenActions = ({ children }: { children: ReactNode }) => {
  return <View className="flex-row justify-between px-4 pb-4">{children}</View>;
};

export default OnBoarding;
