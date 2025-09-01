import { ReactNode } from "react";
import { View } from "react-native";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export const AuthCard = ({ children, className = "" }: AuthCardProps) => {
  return (
    <View className="bg-background justify-center items-center p-3 flex-1">
      <Card
        className={`elevation-xl shadow-sm items-center p-8 rounded-3xl w-full max-w-[400px] bg-secondary ${className}`}
      >
        {children}
      </Card>
    </View>
  );
};

export { CardContent, CardFooter, CardHeader };
