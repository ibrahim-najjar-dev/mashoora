import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Constants from "expo-constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

  if (process.env.NODE_ENV === "development") {
    // For development builds, use a more reliable approach
    const debuggerHost = Constants.expoConfig?.hostUri
      ? Constants.expoConfig.hostUri.split(":").shift()
      : "localhost";

    const origin = `http://${debuggerHost}:8081`;
    console.log("Development Origin URL:", origin);
    console.log("API Path:", path);
    return origin.concat(path);
  }

  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    console.log("Production mode");
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL environment variable is not defined"
    );
  }

  console.log("Production API URL:", process.env.EXPO_PUBLIC_API_BASE_URL);
  return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
};
