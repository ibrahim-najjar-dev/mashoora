import { Text, View, Pressable } from "react-native";
import {
  StepScreenContent,
  StepScreenActions,
  StepScreenHeader,
  StepScreenWrapper,
} from "~/app/(app)/(authenticated)/on-boarding";
import Icons from "../ui/icons";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/constants/Colors";
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import React, { useState, useEffect } from "react";
import { cn } from "~/lib/utils";
import { Id } from "~/convex/_generated/dataModel";
import { Skeleton } from "../ui/skeleton";

// Color mapping for background classes
const colorMap: Record<string, string> = {
  "bg-purple-500": "bg-purple-500",
  "bg-sky-500": "bg-sky-500",
  "bg-indigo-500": "bg-indigo-500",
  "bg-orange-500": "bg-orange-500",
  "bg-rose-500": "bg-rose-500",
  "bg-emerald-500": "bg-emerald-500",
  "bg-yellow-500": "bg-yellow-500",
  "bg-pink-500": "bg-pink-500",
  "bg-blue-500": "bg-blue-500",
  "bg-green-500": "bg-green-500",
  "bg-red-500": "bg-red-500",
  "bg-gray-500": "bg-gray-500",
};

// Define the validation schema
const preferencesSchema = z.object({
  selectedCategories: z
    .array(z.string())
    .min(1, "Please select at least one category"),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

interface PreferencesProps {
  handleNextStep?: () => void;
}

const Preferences: React.FC<PreferencesProps> = ({ handleNextStep }) => {
  const { colorScheme } = useColorScheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = useQuery(api.categories.getCategories);
  const existingPreferences = useQuery(api.user.getUserPreferences);
  const updatePreferences = useMutation(api.user.updateUserPreferences);

  // Initialize react-hook-form with zod validation
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      selectedCategories: [],
    },
    mode: "onChange",
  });

  // Load existing preferences when available
  useEffect(() => {
    if (existingPreferences?.categories) {
      const categoryIds = existingPreferences.categories
        .filter((cat) => cat !== null)
        .map((cat) => cat!._id);
      setValue("selectedCategories", categoryIds);
    }
  }, [existingPreferences, setValue]);

  // Handle category toggle
  const toggleCategory = (categoryId: string, currentSelected: string[]) => {
    if (currentSelected.includes(categoryId)) {
      return currentSelected.filter((id) => id !== categoryId);
    } else {
      return [...currentSelected, categoryId];
    }
  };

  // Handle form submission
  const onSubmit = async (data: PreferencesFormData) => {
    try {
      setIsSubmitting(true);

      // Convert string IDs to proper Convex IDs
      const categoryIds = data.selectedCategories as Id<"categories">[];

      // Save preferences to the database
      await updatePreferences({ categoryIds });

      console.log("Preferences saved successfully:", data.selectedCategories);

      // Navigate to next step if handler is provided
      if (handleNextStep) {
        handleNextStep();
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StepScreenWrapper>
      <StepScreenHeader
        title="Preferences"
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
          Choose categories that interest you to personalize your experience
        </Text>

        <Controller
          control={control}
          name="selectedCategories"
          render={({ field: { value, onChange } }) => (
            <View className="gap-3 flex-row flex-wrap">
              {categories
                ? categories.map((category) => {
                    const isSelected = value.includes(category._id);
                    return (
                      <Pressable
                        key={category._id}
                        onPress={() => {
                          const newValue = toggleCategory(category._id, value);
                          onChange(newValue);
                        }}
                        style={{ opacity: isSelected ? 1 : 0.6 }}
                        className="px-2 h-11 border border-border rounded-lg flex-row items-center gap-2"
                      >
                        <View
                          className={cn(
                            "w-7 h-7 rounded-md justify-center items-center",
                            (category.iconClassName &&
                              colorMap[category.iconClassName]) ||
                              "bg-gray-500"
                          )}
                          style={{
                            borderCurve: "continuous",
                          }}
                        >
                          {category.iconName ? (
                            React.createElement(
                              (Icons as any)[category.iconName],
                              {
                                height: 16,
                                width: 16,
                                color: "#fff",
                              }
                            )
                          ) : (
                            <Icons.SolarHelpBoldDuotone
                              height={24}
                              width={24}
                              className="text-white"
                            />
                          )}
                        </View>
                        <Text
                          className={
                            isSelected
                              ? "text-foreground font-medium"
                              : "text-muted-foreground font-medium"
                          }
                        >
                          {category.name}
                        </Text>
                      </Pressable>
                    );
                  })
                : // skeleton
                  Array.from({ length: 6 }).map((_, index) => {
                    const widths = [
                      "w-20",
                      "w-24",
                      "w-28",
                      "w-32",
                      "w-36",
                      "w-40",
                    ];
                    const randomWidth = widths[index % widths.length];
                    return (
                      <Skeleton
                        key={index}
                        className={`h-11 ${randomWidth} rounded-md`}
                      />
                    );
                  })}
            </View>
          )}
        />
        {errors.selectedCategories && (
          <View className="mt-4 p-3 bg-secondary rounded-xl">
            <Text className="text-destructive text-sm text-center">
              {errors.selectedCategories.message}
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
            {isSubmitting ? "Saving..." : "Continue"}
          </Text>
        </Button>
      </StepScreenActions>
    </StepScreenWrapper>
  );
};

export default Preferences;
