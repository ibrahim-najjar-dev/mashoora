import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { Text, View } from "react-native";
import AvailabilityPicker from "~/components/availability-picker";
import { api } from "~/convex/_generated/api";

const Availability = () => {
  const { userId: clerkUserId } = useAuth();

  const availability = useQuery(api.availability.getConsultantAvailability, {
    clerkUserId: clerkUserId!,
  });

  console.log(availability);

  return (
    <View className="flex-1 bg-background">
      <AvailabilityPicker />
    </View>
  );
};

export default Availability;
