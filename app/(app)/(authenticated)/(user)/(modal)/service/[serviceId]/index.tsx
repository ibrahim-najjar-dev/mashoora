import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ReactNode } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SharedList } from "~/components/shared-list";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Icons from "~/components/ui/icons";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";

const ICON_SIZE = 18;

const professionalCredentials = {
  education: [
    {
      degree: "Master of Laws (LL.M.)",
      institution: "Harvard Law School",
      year: 2020,
    },
    {
      degree: "Bachelor of Laws (LL.B.)",
      institution: "University of Toronto",
      year: 2018,
    },
  ],
  experience: [
    {
      title: "Senior Immigration Consultant",
      company: "ABC Immigration Services",
      duration: "2020 - Present",
    },
    {
      title: "Legal Intern",
      company: "XYZ Law Firm",
      duration: "2018 - 2020",
    },
  ],
  certifications: [
    {
      name: "Certified Immigration Consultant (CIC)",
      institution:
        "Canadian Association of Professional Immigration Consultants",
      year: 2021,
    },
    {
      name: "Commissioner for Oaths",
      institution: "Government of Alberta",
      year: 2019,
    },
  ],
  specializations: [
    "Express Entry",
    "Family Sponsorship",
    "Work Permits",
    "Study Permits",
    "Citizenship Applications",
  ],
  verificationStatus: {
    identityVerified: true,
    credentialsVerified: true,
    backgroundChecked: true,
  },
};

const ServiceDetailsData = {
  title: "Immigration Consultation",
  description:
    " Comprehensive immigration consultation covering visa applications, documentation requirements, legal procedures, and personalized guidance for your journey.",
  duration: "60 minutes",
};

const ServiceDetails = () => {
  // Extract bookingId from the route params
  const { serviceId } = useLocalSearchParams();
  console.log("Service ID from details sheet:", serviceId);
  const router = useRouter();

  const insets = useSafeAreaInsets();

  return (
    <>
      <View className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom,
            paddingTop: insets.top,
          }}
        >
          {/* Service Provider Section */}
          <View className="px-4 mb-6">
            <View className="rounded-3xl bg-secondary p-4 border border-neutral-700/15">
              <View className="flex-row gap-4 mb-4">
                <View className="w-16 h-16 bg-rose-500 rounded-xl items-center justify-center">
                  <Icons.SolarUserCircleBoldDuotone
                    height={32}
                    width={32}
                    color="#fff"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-Geist_Medium mb-1">
                    Dr. Ahmed Hassan
                  </Text>
                  <Text className="text-sm text-muted-foreground mb-2">
                    Immigration Consultant
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Icons.SolarStarBold
                      height={16}
                      width={16}
                      color="#fbbf24"
                    />
                    <Text className="text-sm font-Mono_SemiBold">4.8</Text>
                    <Text className="text-sm text-muted-foreground">
                      (127 reviews)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Service Tags */}
              <View className="flex-row items-center gap-2 flex-wrap mb-4">
                <Badge
                  variant={"outline"}
                  className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                >
                  <View
                    style={{
                      height: 14,
                      width: 14,
                      borderRadius: 4,
                    }}
                    className="items-center justify-center bg-rose-500"
                  >
                    <Icons.SolarHeartPulseBoldDuotone
                      height={12}
                      width={12}
                      color="#fff"
                    />
                  </View>
                  <Text className="text-xs">Immigration Services</Text>
                </Badge>
                <Badge
                  variant={"outline"}
                  className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                >
                  <Icons.SolarVideocameraRecordBold
                    height={12}
                    width={12}
                    color="#f43f5e"
                  />
                  <Text className="text-xs">60 min</Text>
                </Badge>
                <Badge
                  variant={"outline"}
                  className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                >
                  <Icons.SolarMedalRibbonsStarBoldDuotone
                    height={12}
                    width={12}
                    color="#fff"
                  />
                  <Text className="text-xs">+8 years</Text>
                </Badge>
                <Badge
                  variant={"outline"}
                  className="flex-row items-center gap-x-1.5 px-1.5 rounded-md py-1"
                >
                  <Icons.SolarUserSpeakRoundedBoldDuotone
                    height={12}
                    width={12}
                    color="#fff"
                  />
                  <Text className="text-xs">Arabic, English</Text>
                </Badge>
              </View>
            </View>
          </View>

          {/* Service Details */}
          <View className="px-4 mb-6">
            <Text className="text-lg font-Geist_Medium mb-3">
              Service Details
            </Text>
            <View className="bg-secondary rounded-2xl border border-neutral-700/15 p-4">
              <Text className="text-base font-Geist_Medium mb-2">
                {ServiceDetailsData.title}
              </Text>
              <Text className="text-sm text-muted-foreground mb-4 leading-5">
                {ServiceDetailsData.description}
              </Text>
            </View>
          </View>

          {/* Professional Credentials */}
          <View className="px-4 mb-6">
            <Text className="text-lg font-Geist_Medium mb-3">
              Professional Credentials
            </Text>
            <View className="bg-secondary rounded-2xl border border-neutral-700/15 p-4 space-y-4">
              {/* Education */}
              <SharedList
                data={professionalCredentials.education}
                keyExtractor={(item) => item.degree}
                ListHeaderComponent={
                  <CardSectionHeader
                    title="Education"
                    icon={
                      <Icons.SolarSquareAcademicCapBoldDuotone
                        height={ICON_SIZE}
                        width={ICON_SIZE}
                        color="#fbbf24"
                      />
                    }
                  />
                }
                contentContainerClassName="gap-2"
                renderItem={({ item }) => (
                  <View className="ml-6 space-y-1">
                    <Text className="text-sm text-foreground">
                      {item.degree}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {item.institution}, {item.year}
                    </Text>
                  </View>
                )}
              />

              <Separator className="my-4" />

              {/* Certifications */}

              <SharedList
                data={professionalCredentials.certifications}
                keyExtractor={(item) => item.name}
                contentContainerClassName="gap-2"
                renderItem={({ item }) => (
                  <View className="ml-6 space-y-1">
                    <Text className="text-sm text-foreground">{item.name}</Text>
                    <Text className="text-xs text-muted-foreground">
                      {item.institution}, {item.year}
                    </Text>
                  </View>
                )}
                ListHeaderComponent={
                  <CardSectionHeader
                    title="Certifications"
                    icon={
                      <Icons.SolarDiplomaBoldDuotone
                        height={ICON_SIZE}
                        width={ICON_SIZE}
                        color="#22c55e"
                      />
                    }
                  />
                }
              />

              <Separator className="my-4" />
              {/* Professional Experience */}

              <SharedList
                data={professionalCredentials.experience}
                keyExtractor={(item) => item.title}
                contentContainerClassName="gap-2"
                renderItem={({ item }) => (
                  <View className="ml-6 space-y-1">
                    <Text className="text-sm text-foreground">
                      {item.title}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {item.company}, {item.duration}
                    </Text>
                  </View>
                )}
                ListHeaderComponent={
                  <CardSectionHeader
                    title="Experience"
                    icon={
                      <Icons.SolarMedalRibbonsStarBoldDuotone
                        height={ICON_SIZE}
                        width={ICON_SIZE}
                        color="#3b82f6"
                      />
                    }
                  />
                }
              />

              <Separator className="my-4" />

              {/* Specializations */}

              {/* flat list with wrap */}
              <CardSectionHeader
                title="Specializations"
                icon={
                  <Icons.SolarStarsBoldDuotone
                    height={ICON_SIZE}
                    width={ICON_SIZE}
                    color="#f59e0b"
                  />
                }
              />

              <View className="flex-row items-center gap-2 flex-wrap ml-6">
                {professionalCredentials.specializations.map((spec) => (
                  <Badge
                    key={spec}
                    variant={"outline"}
                    className="flex-row items-center gap-x-1 px-2 rounded-md py-1"
                  >
                    <Text className="text-xs">{spec}</Text>
                  </Badge>
                ))}
              </View>

              <Separator className="my-4" />

              {/* Verification Status */}

              <CardSectionHeader
                title="Verification Status"
                icon={
                  <Icons.SolarUserCheckRoundedBoldDuotone
                    height={ICON_SIZE}
                    width={ICON_SIZE}
                    color="#10b981"
                  />
                }
              />
              <View className="ml-6 space-y-2">
                <View className="flex-row items-center gap-2">
                  <Icons.SolarUserCheckRoundedBoldDuotone
                    height={14}
                    width={14}
                    color="#10b981"
                  />
                  <Text className="text-sm text-green-400">
                    Identity Verified
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Icons.SolarDocumentAddBoldDuotone
                    height={14}
                    width={14}
                    color="#10b981"
                  />
                  <Text className="text-sm text-green-400">
                    Credentials Verified
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Icons.SolarShieldWarningBold
                    height={14}
                    width={14}
                    color="#10b981"
                  />
                  <Text className="text-sm text-green-400">
                    Background Checked
                  </Text>
                </View>
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
                  <Text className="font-Mono_SemiBold text-base">150</Text>
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
                  <Text className="font-Mono_SemiBold text-base">15</Text>
                </View>
              </View>
              <View className="h-px bg-neutral-700/20 mb-3" />
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-Geist_Medium">
                  Total Amount
                </Text>
                <View className="flex-row items-center gap-x-1.5">
                  <Image
                    source={require("~/assets/images/sar_symbol.svg")}
                    style={{ width: 18, height: 18, tintColor: "white" }}
                  />
                  <Text className="font-Mono_Bold text-lg">165</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-4 pb-8 space-y-3">
            <Button
              onPress={() => {
                router.push({
                  pathname:
                    "/(app)/(authenticated)/(user)/(modal)/service/[serviceId]/date-picker",
                  params: { serviceId: serviceId.toString() },
                });
              }}
              className="bg-rose-500 rounded-2xl py-4"
            >
              <Text className="text-white font-Geist_Medium text-base">
                Find Booking
              </Text>
            </Button>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const CardSectionHeader = ({
  title,
  icon,
}: {
  title: string;
  icon: ReactNode;
}) => (
  <View className="flex-row items-center gap-2 mb-2">
    {icon}
    <Text className="text-sm font-Geist_Medium">{title}</Text>
  </View>
);

export default ServiceDetails;
