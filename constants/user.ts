export const USER_ROLES = {
  USER: "user",
  CONSULTANT: "consultant",
  ADMIN: "admin",
};

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
