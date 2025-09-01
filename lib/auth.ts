import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { Roles } from "~/types/globals";

// export const checkRole = async (role: Roles) => {
//   const { sessionClaims } = await useAuth()
//   return sessionClaims?.metadata.role === role
// }

export const useRole = (role: Roles) => {
  const { sessionClaims } = useAuth();
  return sessionClaims?.metadata.role === role;
};

export const isOnBoardingCompleted = (
  sessionClaims: CustomJwtSessionClaims | null | undefined
) => {
  return sessionClaims?.metadata.onBoardingCompleted === true;
};

export const useRoleWithSessionClaims = ({
  role,
  sessionClaims,
}: {
  role: Roles;
  sessionClaims: CustomJwtSessionClaims | null | undefined;
}) => {
  return sessionClaims?.metadata.role === role;
};

export const useCurrentUserRole = () => {
  const { sessionClaims } = useAuth();
  return sessionClaims?.metadata.role;
};

export const getRoleDisplayName = (role: Roles) => {
  switch (role) {
    case "admin":
      return "Administrator";
    case "consultant":
      return "Consultant";
    case "user":
      return "User";
    default:
      return "Unknown Role";
  }
};
