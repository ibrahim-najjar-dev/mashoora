import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Doc } from "~/convex/_generated/dataModel";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import * as Form from "~/components/ui/form";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  StepScreenActions,
  StepScreenContent,
  StepScreenHeader,
  StepScreenWrapper,
} from "~/app/(app)/(authenticated)/on-boarding";

import Icons from "../ui/icons";
import { User } from "@clerk/backend";
import { UserResource } from "@clerk/types";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as FileSystem from "expo-file-system";

// Define the validation schema
const setupProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  image: z.string().optional(),
});

type SetupProfileFormData = z.infer<typeof setupProfileSchema>;

interface SetupProfileProps {
  user: UserResource | null | undefined;
  handleNextStep: () => void;
}

const SetupProfile: React.FC<SetupProfileProps> = ({
  user,
  handleNextStep,
}) => {
  const { colorScheme } = useColorScheme();

  const [image, setImage] = useState<string | null>(user?.imageUrl || null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Initialize react-hook-form with zod validation
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SetupProfileFormData>({
    resolver: zodResolver(setupProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      image: user?.imageUrl || "",
    },
    mode: "onChange", // Validate on change for real-time feedback
  });

  // Watch form values for dynamic updates
  const watchedValues = watch();

  // Check if any changes have been made compared to initial values
  const hasChanges = () => {
    const initialFirstName = user?.firstName || "";
    const initialLastName = user?.lastName || "";
    const initialImage = user?.imageUrl || "";

    const currentFirstName = watchedValues.firstName || "";
    const currentLastName = watchedValues.lastName || "";

    // Check if form fields have changed
    const formChanged =
      currentFirstName !== initialFirstName ||
      currentLastName !== initialLastName;

    // Check if a new image was selected
    const imageChanged = imageBase64 !== null;

    return formChanged || imageChanged;
  };

  // Convert image to base64
  const convertImageToBase64 = async (uri: string): Promise<string | null> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      setUploadError("Failed to process image. Please try again.");
      return null;
    }
  };

  const pickImage = async () => {
    // Clear any previous upload errors
    setUploadError(null);

    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // Only allow images for profile pictures
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.8, // Reduce quality to manage file size
    });
    console.log(result);

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setImage(selectedImage);
      setValue("image", selectedImage); // Update form value

      // Convert image to base64 for Clerk API
      const base64 = await convertImageToBase64(selectedImage);
      if (base64) {
        setImageBase64(base64);
      }
    }
  };

  const onSubmit = async (data: SetupProfileFormData) => {
    try {
      // If no changes were made, just proceed to next step without API calls
      if (!hasChanges()) {
        console.log("No changes detected, proceeding to next step...");
        handleNextStep();
        return;
      }

      // Clear any previous upload errors
      setUploadError(null);

      // Handle profile image upload if a new image was selected
      if (imageBase64) {
        try {
          const res = await user?.setProfileImage({
            file: `data:image/jpeg;base64,${imageBase64}`,
          });

          if (!res?.publicUrl) {
            setUploadError("Failed to upload profile image. Please try again.");
            console.error("Failed to upload profile image");
            // Don't return here, still update the name fields
          } else {
            console.log("Profile image updated successfully");
          }
        } catch (imageError) {
          console.error("Error uploading profile image:", imageError);
          setUploadError("Failed to upload profile image. Please try again.");
          // Continue with name update even if image upload fails
        }
      }

      // Update user profile information only if form fields changed
      const initialFirstName = user?.firstName || "";
      const initialLastName = user?.lastName || "";
      const formFieldsChanged =
        data.firstName !== initialFirstName ||
        data.lastName !== initialLastName;

      if (formFieldsChanged) {
        const userRes = await user?.update({
          firstName: data.firstName,
          lastName: data.lastName,
        });
        console.log("Profile updated successfully:", userRes);
      }

      handleNextStep();
    } catch (error) {
      console.error("Error updating profile:", error);
      setUploadError("Failed to update profile. Please try again.");
      throw error; // Re-throw to show the error to the user
    }
  };

  return (
    <StepScreenWrapper>
      <StepScreenHeader
        title="Setup Your Profile"
        icon={
          <Icons.SolarUserCheckRoundedBoldDuotone
            width={24}
            height={24}
            color={NAV_THEME[colorScheme].text}
          />
        }
      />
      <StepScreenContent>
        <Pressable onPress={pickImage} className="mx-auto">
          <Avatar
            alt="user profile"
            className="h-24 w-24 mt-6 rounded-3xl overflow-hidden"
            style={{ borderCurve: "continuous" }}
          >
            {/* <AvatarImage src={image || user?.imageUrl} /> */}
            <Image
              source={image}
              className="h-24 w-24 mt-6 rounded-3xl"
              style={{
                width: 96,
                height: 96,
              }}
            />
            <AvatarFallback>
              <Text className="text-2xl text-foreground">U</Text>
            </AvatarFallback>
          </Avatar>
        </Pressable>
        <TouchableOpacity onPress={pickImage}>
          <Text className="text-center mt-4 text-lg font-Geist_Medium text-foreground">
            Edit Profile Picture
          </Text>
        </TouchableOpacity>

        {/* Show remove option if user has selected a new image */}
        {imageBase64 && (
          <TouchableOpacity
            onPress={() => {
              setImage(user?.imageUrl || null);
              setImageBase64(null);
              setValue("image", user?.imageUrl || "");
              setUploadError(null);
            }}
          >
            <Text className="text-center mt-2 text-sm text-muted-foreground">
              Remove new picture
            </Text>
          </TouchableOpacity>
        )}

        {/* Display upload error if any */}
        {uploadError && (
          <View className="mx-6 mt-4 p-3 bg-secondary rounded-xl">
            <Text className="text-destructive text-sm text-center">
              {uploadError}
            </Text>
          </View>
        )}

        <View className="mt-4 gap-4 px-6">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Input
                  placeholder="First Name"
                  className="bg-secondary border-transparent rounded-xl"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoComplete="given-name"
                  textContentType="givenName"
                />
                {errors.firstName && (
                  <Text className="text-destructive text-sm mt-1 px-2">
                    {errors.firstName.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Input
                  placeholder="Last Name"
                  className="bg-secondary border-transparent rounded-xl"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoComplete="family-name"
                  textContentType="familyName"
                />
                {errors.lastName && (
                  <Text className="text-destructive text-sm mt-1 px-2">
                    {errors.lastName.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      </StepScreenContent>

      <StepScreenActions>
        <Button
          className="flex-1 rounded-xl"
          size="lg"
          disabled={!isValid || isSubmitting}
          variant={"secondary"}
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-xl text-foreground font-semibold">
            {isSubmitting ? "Updating..." : "Continue"}
          </Text>
        </Button>
      </StepScreenActions>
    </StepScreenWrapper>
  );
};

export default SetupProfile;
