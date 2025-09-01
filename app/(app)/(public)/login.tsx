import { Redirect } from "expo-router";
import { Text, View } from "react-native";

const signedIn = true;

const Login = () => {
  if (signedIn) {
    return <Redirect href={"/(app)/(authenticated)/(user)/(tabs)"} />;
  }

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text>Login</Text>
    </View>
  );
};

export default Login;
