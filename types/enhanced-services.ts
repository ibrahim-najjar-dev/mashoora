import { Doc } from "../convex/_generated/dataModel";

// Enhanced service type with consultant profile and review information
export interface EnhancedService extends Doc<"services"> {
  consultant: {
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    role?: string;
  };
  consultantProfile: {
    bio?: string;
    yearsOfExperience?: number;
    spokenLanguages?: string[];
    averageRating?: number;
    totalReviews?: number;
  } | null;
  category: {
    name: string;
    name_ar?: string;
    description?: string;
    iconClassName?: string;
    iconName?: string;
  } | null;
  reviewStats: {
    averageRating: number;
    totalReviews: number;
  };
  recentReviews: {
    _id: string;
    rating: number;
    comment?: string;
    isVerified?: boolean;
    createdAt: number;
    updatedAt: number;
    user: {
      firstName?: string;
      lastName?: string;
      imageUrl?: string;
    };
  }[];
}

// Paginated enhanced services response
export interface PaginatedEnhancedServices {
  page: EnhancedService[];
  isDone: boolean;
  continueCursor: string;
}

// Review with user information
export interface ReviewWithUser extends Doc<"reviews"> {
  user: {
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
}

// Consultant profile with user information
export interface ConsultantProfileWithUser extends Doc<"consultantProfiles"> {
  user: {
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    phonenumber?: string;
    role?: string;
  };
}
