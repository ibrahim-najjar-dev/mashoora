import { useAction } from "convex/react";
import { useState } from "react";
import { Text, View } from "react-native";
import { api } from "~/convex/_generated/api";
import Icons from "../ui/icons";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { SelectableCard } from "../ui/selectable-card";
import { Button } from "../ui/button";
import { useCurrentUserRole } from "~/lib/auth";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  StepScreenContent,
  StepScreenActions,
  StepScreenHeader,
  StepScreenWrapper,
} from "~/app/(app)/(authenticated)/on-boarding";

// Define the validation schema
const welcomeSchema = z.object({
  selectedRole: z.string().min(1, "Please select your role to continue"),
});

type WelcomeFormData = z.infer<typeof welcomeSchema>;

interface WelcomeScreenProps {
  handleNextStep?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ handleNextStep }) => {
  const { colorScheme } = useColorScheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateUserRole = useAction(api.user.updateClerkUserRole);

  // Initialize react-hook-form with zod validation
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<WelcomeFormData>({
    resolver: zodResolver(welcomeSchema),
    defaultValues: {
      selectedRole: "",
    },
    mode: "onChange",
  });

  // Role options for selection
  const roleOptions = [
    {
      id: "user",
      icon: (
        <Icons.SolarUserCircleBoldDuotone
          height={24}
          width={24}
          color={NAV_THEME[colorScheme].text}
        />
      ),
      title: "I'm looking for consultation",
      description:
        "I need expert advice and guidance for my projects or questions",
    },
    {
      id: "consultant",
      icon: (
        <Icons.SolarSquareAcademicCapBoldDuotone
          height={24}
          width={24}
          color={NAV_THEME[colorScheme].text}
        />
      ),
      title: "I'm a consultant",
      description:
        "I provide professional consultation services in my field of expertise",
    },
  ];

  // Handle form submission
  const onSubmit = async (data: WelcomeFormData) => {
    try {
      setIsSubmitting(true);

      // Update user role in Clerk
      await updateUserRole({ role: data.selectedRole });

      console.log("Role updated successfully:", data.selectedRole);

      // Navigate to next step if handler is provided
      if (handleNextStep) {
        handleNextStep();
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StepScreenWrapper>
      <StepScreenHeader
        title="Welcome to Mashoora"
        icon={
          <Icons.SolarStarBold
            width={24}
            height={24}
            color={NAV_THEME[colorScheme].text}
          />
        }
      />
      <StepScreenContent>
        <Text className="text-muted-foreground mb-6 mt-2">
          Let&apos;s get you set up in just a few steps. First, tell us your
          role:
        </Text>

        <Controller
          control={control}
          name="selectedRole"
          render={({ field: { value, onChange } }) => (
            <View className="w-full gap-y-4">
              {roleOptions.map((role) => (
                <SelectableCard
                  key={role.id}
                  id={role.id}
                  icon={role.icon}
                  title={role.title}
                  description={role.description}
                  isSelected={value === role.id}
                  onPress={(roleId) => onChange(roleId)}
                  activeBorderColor="border-primary"
                  defaultBorderColor="border-border"
                  activeBackgroundColor="bg-secondary"
                />
              ))}
            </View>
          )}
        />

        {errors.selectedRole && (
          <View className="mt-4 p-3 bg-secondary rounded-xl">
            <Text className="text-destructive text-sm text-center">
              {errors.selectedRole.message}
            </Text>
          </View>
        )}
      </StepScreenContent>

      <StepScreenActions>
        <Button
          className="flex-1 rounded-xl"
          size="lg"
          disabled={!isValid || isSubmitting}
          variant="secondary"
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-xl text-foreground font-semibold">
            {isSubmitting ? "Setting up..." : "Continue"}
          </Text>
        </Button>
      </StepScreenActions>
    </StepScreenWrapper>
  );
};

export default WelcomeScreen;
