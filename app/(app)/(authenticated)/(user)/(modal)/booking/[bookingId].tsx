import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ReactNode } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Icons from "~/components/ui/icons";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

// Dummy booking data for illustration
const booking = {
  bookingId: "BK123456",
  service: {
    title: "Immigration Consultation",
    description:
      "Comprehensive immigration consultation covering visa applications, documentation requirements, legal procedures, and personalized guidance.",
    duration: 60,
    price: 150,
    currency: "SAR",
  },
  consultant: {
    name: "Dr. Ahmed Hassan",
    role: "Immigration Consultant",
    rating: 4.8,
    reviews: 127,
    languages: ["Arabic", "English"],
  },
  user: {
    name: "Ibrahim Najjar",
  },
  date: "2025-09-05",
  time: "14:30",
  status: "confirmed",
  notes: "Please bring all previous immigration documents.",
  platformFee: 15,
  totalAmount: 165,
};
const BookingDetails = () => {
  const { bookingId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const booking = useQuery(api.bookings.getDetailedBookingDataById, {
    bookingId: bookingId as Id<"bookings">,
  });

  console.log("Booking ID:", bookingId);

  if (!booking) {
    return null;
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
          paddingTop: insets.top,
        }}
      >
        {/* Booking Header */}
        <View className="px-4 mb-6">
          <View className="rounded-3xl bg-secondary p-4 border border-neutral-700/15">
            <Text className="text-xl font-Geist_Medium mb-2">
              Booking ID: {booking?._id}
            </Text>
            <View className="flex-row items-center gap-2">
              <Icons.SolarClockCircleBold
                height={16}
                width={16}
                color="#f59e0b"
              />
              <Text className="text-sm text-muted-foreground">
                {booking.date} at {booking.time}
              </Text>
            </View>
            <View className="flex-row items-center gap-2 mt-2">
              <Icons.SolarUserCheckRoundedBoldDuotone
                height={16}
                width={16}
                color="#10b981"
              />
              <Text className="text-sm text-green-400 font-Mono_SemiBold">
                {booking.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Consultant Info */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-Geist_Medium mb-3">Consultant</Text>
          <View className="bg-secondary rounded-2xl border border-neutral-700/15 p-4 flex-row gap-4 items-center">
            <View className="w-16 h-16 bg-rose-500 rounded-xl items-center justify-center">
              <Icons.SolarUserCircleBoldDuotone
                height={32}
                width={32}
                color="#fff"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-Geist_Medium mb-1">
                {booking.user?.firstName} {booking.user?.lastName}
              </Text>
              <Text className="text-sm text-muted-foreground mb-2">
                {booking.user?.role}
              </Text>
              <View className="flex-row items-center gap-2">
                <Icons.SolarStarBold height={16} width={16} color="#fbbf24" />
                <Text className="text-sm font-Mono_SemiBold">3.5</Text>
                <Text className="text-sm text-muted-foreground">
                  (500 reviews)
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground mt-1">
                Languages: arabic, english
              </Text>
            </View>
          </View>
        </View>

        {/* Service Info */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-Geist_Medium mb-3">
            Service Details
          </Text>
          <View className="bg-secondary rounded-2xl border border-neutral-700/15 p-4">
            <Text className="text-base font-Geist_Medium mb-2">
              {booking.service?.name}
            </Text>
            <Text className="text-sm text-muted-foreground mb-4 leading-5">
              {booking.service?.description}
            </Text>
            <View className="flex-row items-center gap-2">
              <Icons.SolarVideocameraRecordBold
                height={14}
                width={14}
                color="#f43f5e"
              />
              <Text className="text-sm">{booking.service?.duration} min</Text>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-Geist_Medium mb-3">Pricing</Text>
          <View className="bg-secondary rounded-2xl border border-neutral-700/15 p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm text-muted-foreground">
                Consultation Fee
              </Text>
              <View className="flex-row items-center gap-x-1.5">
                <Image
                  source={require("~/assets/images/sar_symbol.svg")}
                  style={{ width: 16, height: 16, tintColor: "white" }}
                />
                <Text className="font-Mono_SemiBold text-base">
                  {booking.service?.price}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm text-muted-foreground">
                Platform Fee
              </Text>
              <View className="flex-row items-center gap-x-1.5">
                <Image
                  source={require("~/assets/images/sar_symbol.svg")}
                  style={{ width: 16, height: 16, tintColor: "white" }}
                />
                <Text className="font-Mono_SemiBold text-base">20</Text>
              </View>
            </View>
            <View className="h-px bg-neutral-700/20 mb-3" />
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-Geist_Medium">Total Amount</Text>
              <View className="flex-row items-center gap-x-1.5">
                <Image
                  source={require("~/assets/images/sar_symbol.svg")}
                  style={{ width: 18, height: 18, tintColor: "white" }}
                />
                <Text className="font-Mono_Bold text-lg">
                  {booking.service?.price! + 20}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        {booking.notes && (
          <View className="px-4 mb-6">
            <Text className="text-lg font-Geist_Medium mb-3">Notes</Text>
            <View className="bg-secondary rounded-2xl border border-neutral-700/15 p-4">
              <Text className="text-sm text-muted-foreground">
                {booking.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="px-4 pb-8 gap-y-3">
          <Link asChild href={`/video/${bookingId}`}>
            <Button variant={"default"} onPress={() => router.back()}>
              <Text className="text-foreground font-Geist_Medium text-base">
                Join Call
              </Text>
            </Button>
          </Link>
          <Button
            className="bg-secondary rounded-2xl py-4 border border-neutral-700/20"
            onPress={() => router.back()}
          >
            <Text className="text-foreground font-Geist_Medium text-base">
              Back
            </Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

// <View className="flex-1 justify-center items-center">
//   <Link
//     href={{
//       pathname: "/(app)/(authenticated)/(user)/(modal)/video/[id]",
//       params: { id: bookingId },
//     }}
//   >
//     JOIN CALL
//   </Link>
// </View>
export default BookingDetails;
