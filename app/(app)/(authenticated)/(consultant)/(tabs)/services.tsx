import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { Text, View } from "react-native";
import { ServiceCardsContainer } from "~/components/service-cards/service-cards-container";
import { Link } from "~/components/ui/form";
import { api } from "~/convex/_generated/api";

const Services = () => {
  const { userId } = useAuth();
  const myServices = useQuery(
    api.consultantServices.getCurrentConsultantServices
  );

  console.log("My Services:", myServices);

  return (
    <View className="flex-1">
      <Link href={"/create-service"} className="pt-20">
        Create New Service
      </Link>
      {/* <ServiceCardsContainer data={myServices || []} /> */}
    </View>
  );
};

export default Services;
