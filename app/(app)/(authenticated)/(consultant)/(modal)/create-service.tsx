import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Text,
  View,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import z from "zod";
// ADD-BACK
// import {
//   ColorPicker,
//   LabelPrimitive,
//   List,
//   Picker,
//   TextInput,
// } from "@expo/ui/swift-ui";
import React, { useEffect } from "react";
import * as Form from "~/components/ui/form";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Id } from "~/convex/_generated/dataModel";
import { useRouter } from "expo-router";

const durationOptions = [
  { label: "30 mins", value: 30 },
  { label: "45 mins", value: 45 },
  { label: "1 hour", value: 60 },
];

const createServiceSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters long" }),
  price: z
    .number()
    .min(10, { message: "Price must be a positive number" })
    .max(1000, { message: "Price must be less than 1000" }),
  duration: z
    .number()
    .refine((val) => durationOptions.map((o) => o.value).includes(val), {
      message: "Duration must be 30, 45, or 60",
    }),
  category: z
    .string()
    .min(2, { message: "Category must be at least 2 characters long" }),
});

const CreateService = () => {
  const categories = useQuery(api.categories.getCategories);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      title: "",
      price: 0,
      duration: durationOptions[0].value,
      category: categories ? categories[0]._id : "",
    },
  });

  const router = useRouter();

  const createService = useMutation(api.consultantServices.createService);

  // Function to handle form submission
  const onSubmit = async (data: z.infer<typeof createServiceSchema>) => {
    console.log(data);
    try {
      const serviceId = await createService({
        name: data.title,
        price: data.price,
        duration: data.duration,
        categoryId: data.category as Id<"categories">,
      });
      console.log("Service created with ID:", serviceId);
      router.back();
    } catch (error) {
      console.error("Error creating service:", error);
    }
  };

  const { colorScheme } = useColorScheme();

  if (!categories) {
    return <Text>Loading...</Text>;
  }

  return (
    // <KeyboardAvoidingView className="flex-1 bg-background" behavior="padding">
    <Form.List
      navigationTitle="Create New Service"
      className="bg-background"
      showsVerticalScrollIndicator={false}
    >
      <Form.Section title="Title" footer={errors.title?.message}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <Form.TextField
              placeholder="Enter service title"
              cursorColor={NAV_THEME[colorScheme].primary}
              enterKeyHint="done"
              maxLength={50}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
      </Form.Section>
      <Form.Section title="Price" footer={errors.price?.message}>
        {/* <Form.TextField
            placeholder="Enter service price"
            keyboardType="numeric"
            cursorColor={NAV_THEME[colorScheme].primary}
            maxLength={6}
          /> */}
        <Controller
          control={control}
          name="price"
          defaultValue={0} // ✅ Important for controlled component
          render={({ field: { onChange, onBlur, value } }) => (
            <Form.TextField
              placeholder="Enter service price"
              keyboardType="numeric"
              cursorColor={NAV_THEME[colorScheme].primary}
              maxLength={6}
              value={value ? String(value) : ""}
              onChangeText={(text) => {
                // Remove non-numeric characters except dot
                const cleanedText = text.replace(/[^0-9.]/g, "");

                // Convert to number
                const numericValue = parseFloat(cleanedText);

                // Update only if it's a valid number, otherwise set to undefined
                onChange(isNaN(numericValue) ? undefined : numericValue);
              }}
              onBlur={onBlur}
            />
          )}
        />
      </Form.Section>

      <Form.Section title="Category" footer={errors.category?.message}>
        <Form.FormItem>
          {/* <Controller
            control={control}
            name="category"
            render={({ field: { onChange, onBlur, value } }) => (
              <Picker
                variant="wheel"
                options={categories.map((category) => category.name)}
                selectedIndex={0}
                label="Category"
                onOptionSelected={(e) => {
                  onChange(categories[e.nativeEvent.index]._id);
                }}
                style={{
                  height: 140,
                }}
              />
            )}
          /> */}
        </Form.FormItem>
      </Form.Section>
      <Form.Section title="Duration" footer={errors.duration?.message}>
        <Form.FormItem>
          {/* <Controller
            control={control}
            name="duration"
            render={({ field: { onChange, onBlur, value } }) => (
              <Picker
                variant="wheel"
                options={durationOptions.map((opt) => opt.label)}
                selectedIndex={durationOptions.findIndex(
                  (opt) => opt.value === value
                )}
                label="Duration"
                onOptionSelected={(e) => {
                  const selectedValue =
                    durationOptions[e.nativeEvent.index].value;
                  onChange(selectedValue); // now it's a number
                }}
                style={{ height: 140 }}
              />
            )}
          /> */}
        </Form.FormItem>
      </Form.Section>

      <Button
        className="mx-5 rounded-xl flex-row justify-center items-center"
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting} // disables while submitting
      >
        {isSubmitting ? (
          <ActivityIndicator
            size="small"
            color={NAV_THEME[colorScheme].background}
          />
        ) : (
          <Text className="text-lg font-Geist_SemiBold">Submit</Text>
        )}
      </Button>
    </Form.List>
    // </KeyboardAvoidingView>
  );
};

export default CreateService;
