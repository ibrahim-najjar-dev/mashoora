const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "react-native/Libraries/Renderer/shims/ReactNativeTypes":
    require.resolve("react-native"),
  "react-native/Libraries/Utilities/Platform": require.resolve("react-native"),
};

config.resolver.resolutionMainFields = ["react-native", "browser", "main"];

module.exports = withNativeWind(config, { input: "./global.css" });
