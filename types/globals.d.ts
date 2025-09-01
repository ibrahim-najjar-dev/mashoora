export {};

// Create a type for the roles
export type Roles = "user" | "consultant" | "admin";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
      onBoardingCompleted?: boolean;
    };
  }
}
