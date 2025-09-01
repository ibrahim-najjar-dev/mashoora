import { Image } from "expo-image";
import { ScrollView, View, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";
import { Badge } from "~/components/ui/badge";
import Icons from "~/components/ui/icons";

const About = () => {
  const insets = useSafeAreaInsets();

  const features = [
    {
      icon: (
        <Icons.SolarClockCircleLineDuotone
          width={20}
          height={20}
          color="#3b82f6"
        />
      ),
      title: "Easy Scheduling",
      description:
        "Book consultations with top professionals in just a few taps",
    },
    {
      icon: (
        <Icons.SolarUserSpeakRoundedBoldDuotone
          width={20}
          height={20}
          color="#10b981"
        />
      ),
      title: "Expert Consultants",
      description:
        "Connect with verified experts across various fields and specialties",
    },
    {
      icon: (
        <Icons.SolarVideocameraRecordBold
          width={20}
          height={20}
          color="#f59e0b"
        />
      ),
      title: "Flexible Sessions",
      description:
        "Choose from video calls, phone calls, or in-person meetings",
    },
    {
      icon: (
        <Icons.SolarShieldWarningBold width={20} height={20} color="#8b5cf6" />
      ),
      title: "Secure & Private",
      description:
        "Your conversations and data are protected with end-to-end encryption",
    },
  ];

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@Mashoora.app");
  };

  const handleVisitWebsite = () => {
    Linking.openURL("https://Mashoora.app");
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* App Icon and Header */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 items-center justify-center mb-4 shadow-lg border border-border/50">
          <Image
            source={require("~/assets/icons/splash-icon-light.png")}
            style={{ width: 64, height: 64 }}
            contentFit="contain"
          />
        </View>
        <Text className="text-3xl font-Geist_Bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text">
          Mashoora
        </Text>
        <Badge variant="secondary" className="mb-4 px-3 py-1">
          <Text className="text-xs font-Mono_Medium">Version 1.0.0</Text>
        </Badge>
        <Text className="text-lg text-muted-foreground text-center leading-6 max-w-sm">
          Your trusted platform for professional consultations
        </Text>
      </View>

      {/* About Description */}
      <View className="mb-8">
        <Text className="text-xl font-Geist_SemiBold mb-4">About Mashoora</Text>
        <Text className="text-base text-muted-foreground leading-6 mb-4">
          Mashoora is a revolutionary consultation platform that connects you
          with expert professionals across various fields. Whether you need
          business advice, medical consultation, legal guidance, or specialized
          expertise, our platform makes it easy to find and book sessions with
          qualified consultants.
        </Text>
        <Text className="text-base text-muted-foreground leading-6">
          We believe that everyone deserves access to professional expertise.
          Our mission is to democratize consultation services by providing a
          seamless, secure, and user-friendly platform that benefits both
          consultants and clients.
        </Text>
      </View>

      {/* Features Section */}
      <View className="mb-8">
        <Text className="text-xl font-Geist_SemiBold mb-6">Key Features</Text>
        <View className="gap-y-4">
          {features.map((feature, index) => (
            <View
              key={index}
              className="flex-row p-4 bg-secondary/50 rounded-2xl border border-border/30 shadow-sm"
            >
              <View className="w-12 h-12 rounded-xl bg-background items-center justify-center mr-4 shadow-sm border border-border/20">
                {feature.icon}
              </View>
              <View className="flex-1">
                <Text className="text-base font-Geist_Medium mb-2">
                  {feature.title}
                </Text>
                <Text className="text-sm text-muted-foreground leading-5">
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* How It Works */}
      <View className="mb-8">
        <Text className="text-xl font-Geist_SemiBold mb-6">How It Works</Text>
        <View className="gap-y-4">
          <View className="flex-row items-start">
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-4 mt-1">
              <Text className="text-foreground text-sm font-Mono_Bold">1</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-Geist_Medium mb-1">
                Browse & Discover
              </Text>
              <Text className="text-sm text-muted-foreground">
                Explore our curated list of expert consultants and their
                specialties
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-4 mt-1">
              <Text className="text-foreground text-sm font-Mono_Bold">2</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-Geist_Medium mb-1">
                Book Your Session
              </Text>
              <Text className="text-sm text-muted-foreground">
                Choose your preferred time slot and consultation format
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-4 mt-1">
              <Text className="text-foreground text-sm font-Mono_Bold">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-Geist_Medium mb-1">
                Get Expert Advice
              </Text>
              <Text className="text-sm text-muted-foreground">
                Connect with your consultant and receive personalized guidance
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Contact & Support */}
      <View className="mb-8">
        <Text className="text-xl font-Geist_SemiBold mb-4">
          Contact & Support
        </Text>
        {/* <View className="gap-y-3">
          <Pressable
            onPress={handleContactSupport}
            className="flex-row items-center p-4 bg-secondary/30 rounded-xl active:bg-secondary/50"
          >
            <Icons.SolarDialogBoldDuotone
              width={20}
              height={20}
              color="#6b7280"
            />
            <Text className="text-base text-foreground ml-3 flex-1">
              Contact Support
            </Text>
            <Icons.SolarExitBoldDuotone
              width={16}
              height={16}
              color="#6b7280"
            />
          </Pressable>

          <Pressable
            onPress={handleVisitWebsite}
            className="flex-row items-center p-4 bg-secondary/30 rounded-xl active:bg-secondary/50"
          >
            <Icons.SolarHomeAngle2LineDuotone
              width={20}
              height={20}
              color="#6b7280"
            />
            <Text className="text-base text-foreground ml-3 flex-1">
              Visit Website
            </Text>
            <Icons.SolarExitBoldDuotone
              width={16}
              height={16}
              color="#6b7280"
            />
          </Pressable>
        </View> */}
      </View>

      {/* Footer */}
      <View className="items-center pt-6 border-t border-border">
        <Text className="text-sm text-muted-foreground text-center mb-2">
          Made with ❤️ for connecting expertise with those who need it
        </Text>
        <Text className="text-xs text-muted-foreground">
          © 2025 Mashoora. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
};

export default About;
