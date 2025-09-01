import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { USER_ROLES } from "../constants/user";

export default defineSchema({
  users: defineTable({
    phonenumber: v.string(),
    clerkUserId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    role: v.union(
      v.literal(USER_ROLES.ADMIN),
      v.literal(USER_ROLES.USER),
      v.literal(USER_ROLES.CONSULTANT)
    ),
    streamToken: v.optional(v.string()),
    onBoardingCompleted: v.optional(v.boolean()),
  })
    .index("byClerkUserId", ["clerkUserId"])
    .index("byPhoneNumber", ["phonenumber"]),
  consultantProfiles: defineTable({
    userId: v.id("users"),
    clerkUserId: v.string(),
    bio: v.optional(v.string()),
    yearsOfExperience: v.optional(v.number()), // Years of experience
    spokenLanguages: v.optional(v.array(v.string())), // Array of language codes (e.g., ["en", "ar", "fr"])
    averageRating: v.optional(v.number()), // Average rating (1-5)
    totalReviews: v.optional(v.number()), // Total number of reviews
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byUserId", ["userId"])
    .index("byClerkUserId", ["clerkUserId"])
    .index("byAverageRating", ["averageRating"])
    .index("byYearsOfExperience", ["yearsOfExperience"]),
  services: defineTable({
    consultantId: v.id("users"),
    name: v.string(),
    name_ar: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.number(),
    duration: v.number(), // in minutes
    // category
    // consultantProfileId: v.id("consultantProfiles"),
    categoryId: v.id("categories"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byConsultantId", ["consultantId"])
    .index("byPrice", ["price"]) // For price filtering
    .index("byDuration", ["duration"]) // For duration filtering
    .index("byCategoryId", ["categoryId"]) // For category filtering
    .index("byPriceAndCategory", ["price", "categoryId"]) // For combined price + category filtering
    .searchIndex("search_body", {
      searchField: "name",
    }),
  categories: defineTable({
    name: v.string(),
    name_ar: v.optional(v.string()),
    description: v.optional(v.string()),
    iconClassName: v.optional(v.string()),
    iconName: v.optional(v.string()),
  }).index("byName", ["name"]),
  bookings: defineTable({
    userId: v.id("users"),
    serviceId: v.id("services"),
    date: v.string(), // Format: "2025-08-28"
    time: v.string(), // Format: "14:30"
    duration: v.number(), // Duration in minutes
    currency: v.string(), // Currency code (e.g., "SAR")
    status: v.union(
      v.literal("pending_payment"), // Booking created, waiting for payment
      v.literal("payment_processing"), // Payment is being processed
      v.literal("confirmed"), // Payment successful, booking confirmed
      v.literal("cancelled"), // Booking cancelled
      v.literal("completed"), // Service completed
      v.literal("refunded"), // Payment refunded
      v.literal("failed") // Payment failed
    ),
    notes: v.optional(v.string()), // Additional booking notes
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byUserId", ["userId"])
    .index("byServiceId", ["serviceId"])
    .index("byStatus", ["status"])
    .index("byDate", ["date"]),

  consultantAvailability: defineTable({
    userId: v.id("users"),
    dayOfWeek: v.union(
      v.literal("Monday"),
      v.literal("Tuesday"),
      v.literal("Wednesday"),
      v.literal("Thursday"),
      v.literal("Friday"),
      v.literal("Saturday"),
      v.literal("Sunday")
    ),
    timeRanges: v.array(
      v.object({
        startTime: v.string(), // Format: "09:00"
        endTime: v.string(), // Format: "17:00"
      })
    ),
    isActive: v.boolean(), // Whether this day is available
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byUserId", ["userId"])
    .index("byDayOfWeek", ["dayOfWeek"])
    .index("byUserIdAndDay", ["userId", "dayOfWeek"]),
  userPreferences: defineTable({
    userId: v.id("users"),
    clerkUserId: v.string(),
    categoryIds: v.array(v.id("categories")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byUserId", ["userId"])
    .index("byClerkUserId", ["clerkUserId"]),

  reviews: defineTable({
    userId: v.id("users"), // User who wrote the review
    consultantId: v.id("users"), // Consultant being reviewed
    bookingId: v.optional(v.id("bookings")), // Associated booking (optional)
    rating: v.number(), // Rating (1-5)
    comment: v.optional(v.string()), // Review comment
    isVerified: v.optional(v.boolean()), // Whether this review is from a verified booking
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byConsultantId", ["consultantId"])
    .index("byUserId", ["userId"])
    .index("byBookingId", ["bookingId"])
    .index("byRating", ["rating"])
    .index("byCreatedAt", ["createdAt"]),
});
