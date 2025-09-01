import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Signature,
} from "lucide-react-native";
import { Text, View } from "react-native";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { NAV_THEME } from "~/constants/Colors";
import { useColorScheme } from "~/lib/useColorScheme";

export type BookingCardPropsType = {
  id: string;
  bookingTitle: string;
  bookingDate: string;
  bookingTime: string;
  consultant: {
    name: string;
    profilePictureUrl: string;
    online?: boolean;
  };
  meetingDuration: string;
  bookingStatus: "ready" | "pending" | "cancelled";
};

const BookingCard: React.FC<BookingCardPropsType> = ({
  bookingDate,
  bookingStatus,
  bookingTime,
  bookingTitle,
  consultant,
  id,
  meetingDuration,
}) => {
  const { colorScheme } = useColorScheme();

  return (
    <Card className="rounded-none border-0">
      <CardHeader className="flex-row justify-between gap-x-2 p-3 space-y-0">
        <View className="flex-row gap-x-2 items-center">
          <Badge variant={"ghost"} className="px-0.5">
            <View className="flex-row items-center gap-x-1">
              <Calendar size={14} color={NAV_THEME[colorScheme].muted} />
              <Text className="font-Mono_Regular text-sm text-muted-foreground">
                {bookingDate}
              </Text>
            </View>
          </Badge>
          <Badge variant={"ghost"} className="px-0.5">
            <View className="flex-row items-center gap-x-1">
              <Clock size={14} color={NAV_THEME[colorScheme].muted} />
              <Text className="font-Mono_Regular text-sm text-muted-foreground">
                {bookingTime}
              </Text>
            </View>
          </Badge>

          <Badge
            variant="default"
            className="w-auto flex-row items-center gap-x-1"
          >
            <View className="h-2 w-2 rounded-full bg-destructive" />
            {/* <Video size={14} color={NAV_THEME[colorScheme].destructive} /> */}
            <Text className="text-background font-Mono_Medium text-sm">
              {meetingDuration}m
            </Text>
          </Badge>
        </View>
        <View className="flex-row items-center gap-x-2">
          {/* status */}
          <Badge
            variant={"secondary"}
            className="flex-row ietems-center gap-x-1.5 bg-green-200"
          >
            <CheckCircle size={14} color={"#16a34a"} />
            <Text className="font-Geist_Medium text-base text-green-600">
              {bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)}
            </Text>
          </Badge>
        </View>
      </CardHeader>
      <CardContent className="p-3 py-1">
        <View className="flex-row items-center justify-center gap-x-3">
          <Signature size={20} color={NAV_THEME[colorScheme].text} />
          <Text className="text-xl font-Geist_SemiBold flex-1">
            {bookingTitle}
          </Text>
        </View>
      </CardContent>
      <CardFooter className="p-3 flex-row items-center justify-between">
        <View className="flex-row items-center justify-between gap-x-3">
          <Badge
            variant={"secondary"}
            className="px-1.5 py-1 flex-row ietems-center gap-x-2 border "
          >
            <Avatar className="h-7 w-7" alt="profile picture">
              <AvatarImage source={require("~/assets/images/cat.jpg")} />
              <AvatarFallback></AvatarFallback>
            </Avatar>
            <Text className="font-Geist_Medium text-base text-muted-foreground">
              {consultant.name}
            </Text>
            {consultant.online && (
              <View className="h-2 w-2 rounded-full bg-green-600" />
            )}
          </Badge>
        </View>
        <View>
          <Button size={"sm"} className="h-9 flex-row items-center gap-x-1.5">
            <Text className="text-sm font-Geist_Regular text-background">
              Join call
            </Text>
            <ChevronRight size={16} color={NAV_THEME[colorScheme].background} />
          </Button>
        </View>
      </CardFooter>
    </Card>
  );
};

export default BookingCard;
