import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, ScrollView, Text, View } from "react-native";

import {
  ApplePay,
  ApplePayConfig,
  CreditCard,
  CreditCardConfig,
  GeneralError,
  NetworkEndpointError,
  NetworkError,
  PaymentConfig,
  PaymentResponse,
  PaymentStatus,
  StcPay,
  SamsungPay,
  SamsungPayConfig,
  TokenResponse,
  PaymentResult,
  UnexpectedError,
} from "react-native-moyasar-sdk";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { NAV_THEME } from "~/constants/Colors";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";
import { useColorScheme } from "~/lib/useColorScheme";
import * as Crypto from "expo-crypto";
import React from "react";
import { useAuth } from "@clerk/clerk-expo";

const Payment = () => {
  const { userId } = useAuth();

  const { serviceId, selectedDate, selectedTimeSlot } = useLocalSearchParams<{
    serviceId: string;
    selectedDate: string;
    selectedTimeSlot: string;
  }>();
  console.log("Service ID from payment:", serviceId);

  const router = useRouter();

  const serviceData = useQuery(
    api.consultantServices.getServiceById,
    serviceId && typeof serviceId === "string"
      ? { serviceId: serviceId as Id<"services"> }
      : "skip"
  );

  const { colorScheme } = useColorScheme();

  function onPaymentResult(paymentResult: PaymentResult) {
    if (paymentResult instanceof PaymentResponse) {
      switch (paymentResult.status) {
        case PaymentStatus.paid:
          Alert.alert("Payment Successful", "Thank you for your payment!");
          console.log(paymentResult);
          router.replace("/payment-success");
          break;
        case PaymentStatus.failed:
          Alert.alert("Payment Failed", "Please try again later.");
          break;
        // Handle other statuses if needed
      }
    } else if (paymentResult instanceof TokenResponse) {
      // Not needed if not utilizing 'createSaveOnlyToken' flow
      // Handle token response
      Alert.alert("Token Created", "Your payment token has been created.");
    } else {
      // Handle error

      if (paymentResult instanceof NetworkEndpointError) {
        Alert.alert("Network Error", "Please check your internet connection.");
      } else if (paymentResult instanceof NetworkError) {
        Alert.alert("Network Error", "Please try again later.");
      } else if (paymentResult instanceof GeneralError) {
        Alert.alert("General Error", "An unexpected error occurred.");
      } else if (paymentResult instanceof UnexpectedError) {
        Alert.alert("Unexpected Error", "Something went wrong.");
      }
    }
  }

  // create memo for payment config
  const memoizedPaymentConfig = React.useMemo(() => {
    if (!serviceData || !selectedDate || !selectedTimeSlot || !userId)
      return null;

    return {
      givenId: Crypto.randomUUID(), // Optional. A UUID for the payment provided by you to support Idempotency, UUID v4 is recommended.
      publishableApiKey: "pk_test_wm4XgVQ1EXN1mykYe6Mi1gHegSd9sTq73yQNkmic", // Your Moyasar public API key
      // Amount in the smallest currency unit.
      // For example:
      // 10 SAR = 10 * 100 Halalas which will be 1000 in the amount field
      // 10 KWD = 10 * 1000 Fils which will be 10000 in the amount field
      // 10 JPY = 10 JPY (Japanese Yen does not have fractions) which will be 10 in the amount field
      amount: serviceData.price * 100, // 100 Halalas = 1.00 SAR
      currency: "SAR", // Optional (default: SAR)
      merchantCountryCode: "SA", // Optional. Specify your merchant's principle place of business for Apple Pay and Samsung Pay (default: SA)
      metadata: {
        serviceId,
        selectedDate,
        selectedTimeSlot,
        clerkUserId: userId,
        consultantId: serviceData.consultantId,
        duration: serviceData.duration,
      },
      description: "", // Optional
      supportedNetworks: ["mada", "visa", "mastercard", "amex"], // Optional
      creditCard: new CreditCardConfig({ saveCard: false, manual: false }), // Optional
      applePay: new ApplePayConfig({
        // Required for Apple Pay payments
        merchantId: "YOUR_MERCHANT_ID",
        label: "YOUR_STORE_NAME",
        manual: false, // Optional (default: false)
        saveCard: false, // Optional. For card tokenization (default: false)
      }),
      createSaveOnlyToken: false, // Optional. For save only token flow
      samsungPay: new SamsungPayConfig({
        // Required for Samsung Pay payments
        serviceId: "YOUR_SERVICE_ID", // Your Samsung Pay service ID in the Samsung Pay Merchant dashboard
        merchantName: "YOUR_STORE_NAME",
        orderNumber: "TRANSACTION_ORDER_NUMBER", // Optional (default: random UUID)
        manual: false, // Optional (default: false)
      }),
    };
  }, [userId, serviceId, serviceData, selectedDate, selectedTimeSlot]);

  if (
    !serviceData ||
    !memoizedPaymentConfig ||
    !selectedDate ||
    !selectedTimeSlot ||
    !userId
  ) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted-foreground">
          No Payment Information Available
        </Text>
      </View>
    );
  }

  console.log("Payment configuration:", memoizedPaymentConfig);

  return (
    <ScrollView className="flex-1 bg-background">
      <Card>
        <CardHeader>
          <Text className="text-lg font-medium text-foreground">
            {serviceData ? serviceData.name : "Loading..."}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {serviceData
              ? `Appointment on ${selectedDate} at ${selectedTimeSlot}`
              : ""}
          </Text>
        </CardHeader>
        <CardContent>
          <Text className="text-sm text-muted-foreground">
            {serviceData ? serviceData.description : "Loading..."}
          </Text>
        </CardContent>
        <CardFooter>
          <Text className="text-base font-Geist_Medium text-foreground">
            {serviceData ? `SAR ${serviceData.price}` : ""}
          </Text>
        </CardFooter>
      </Card>

      <CreditCard
        paymentConfig={{
          ...memoizedPaymentConfig,
        }}
        onPaymentResult={onPaymentResult}
        style={{
          textInputs: {
            borderWidth: 1,
            borderColor: NAV_THEME[colorScheme].border,
          },
        }}
      />
      {/* <SamsungPay
        paymentConfig={paymentConfig}
        onPaymentResult={onPaymentResult}
      /> */}
      <ApplePay
        paymentConfig={{ ...memoizedPaymentConfig }}
        onPaymentResult={onPaymentResult}
        style={{ buttonType: "pay" }}
      />
      <StcPay
        paymentConfig={{ ...memoizedPaymentConfig }}
        onPaymentResult={onPaymentResult}
        style={{ textInputs: { borderWidth: 1.25 } }}
      />
    </ScrollView>
  );
};

export default Payment;
