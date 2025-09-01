import { ReactNode } from "react";
import { Text, View } from "react-native";
import { CardHeader, CardTitle } from "~/components/ui/card";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";

interface AuthHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const AuthHeader = ({ icon, title, description }: AuthHeaderProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <CardHeader className="items-center">
      <View className="size-14 rounded-full bg-secondary justify-center items-center border border-border mb-4">
        {icon}
      </View>
      <CardTitle className="mb-2 text-center">{title}</CardTitle>
      <Text className="text-base text-muted-foreground text-center">
        {description}
      </Text>
    </CardHeader>
  );
};
