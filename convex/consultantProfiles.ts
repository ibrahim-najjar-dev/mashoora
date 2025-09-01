import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Get complete consultant profile with all related data
export const getCompleteProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get the consultant profile
    const profile = await ctx.db
      .query("consultantProfiles")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      return null;
    }

    // Get the user information
    const user = await ctx.db.get(args.userId);

    // Get consultant's services
    const services = await ctx.db
      .query("services")
      .withIndex("byConsultantId", (q) => q.eq("consultantId", args.userId))
      .collect();

    // Get categories for services
    const serviceCategories = await Promise.all(
      services.map(async (service) => {
        const category = await ctx.db.get(service.categoryId);
        return { ...service, category };
      })
    );

    // Get consultant availability
    const availability = await ctx.db
      .query("consultantAvailability")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get recent reviews (last 10)
    const recentReviews = await ctx.db
      .query("reviews")
      .withIndex("byConsultantId", (q) => q.eq("consultantId", args.userId))
      .order("desc")
      .take(10);

    // Get reviews with user information
    const reviewsWithUsers = await Promise.all(
      recentReviews.map(async (review) => {
        const reviewUser = await ctx.db.get(review.userId);
        return {
          ...review,
          user: {
            firstName: reviewUser?.firstName,
            lastName: reviewUser?.lastName,
            imageUrl: reviewUser?.imageUrl,
          },
        };
      })
    );

    // Get recent bookings (for analytics)
    const allBookings = [];
    for (const service of services) {
      const serviceBookings = await ctx.db
        .query("bookings")
        .withIndex("byServiceId", (q) => q.eq("serviceId", service._id))
        .collect();
      allBookings.push(...serviceBookings);
    }

    // Sort bookings by creation time
    const recentBookings = allBookings
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    return {
      profile,
      user: {
        firstName: user?.firstName,
        lastName: user?.lastName,
        imageUrl: user?.imageUrl,
        phonenumber: user?.phonenumber,
        role: user?.role,
      },
      services: serviceCategories,
      availability,
      recentReviews: reviewsWithUsers,
      recentBookings,
      stats: {
        totalServices: services.length,
        totalBookings: allBookings.length,
        totalReviews: profile.totalReviews || 0,
        averageRating: profile.averageRating || 0,
      },
    };
  },
});

// Get consultant profile by user ID
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("consultantProfiles")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .first();
    return profile;
  },
});

// Get consultant profile by clerk user ID
export const getByClerkUserId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("consultantProfiles")
      .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
    return profile;
  },
});

// Create or update consultant profile
export const upsertProfile = mutation({
  args: {
    userId: v.id("users"),
    clerkUserId: v.string(),
    bio: v.optional(v.string()),
    yearsOfExperience: v.optional(v.number()),
    spokenLanguages: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("consultantProfiles")
      .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    const now = Date.now();
    const profileData = {
      userId: args.userId,
      clerkUserId: args.clerkUserId,
      bio: args.bio,
      yearsOfExperience: args.yearsOfExperience,
      spokenLanguages: args.spokenLanguages,
      updatedAt: now,
    };

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, profileData);
      return existingProfile._id;
    } else {
      // Create new profile
      const newProfileId = await ctx.db.insert("consultantProfiles", {
        ...profileData,
        createdAt: now,
        averageRating: 0,
        totalReviews: 0,
      });
      return newProfileId;
    }
  },
});

// Update years of experience
export const updateYearsOfExperience = mutation({
  args: {
    clerkUserId: v.string(),
    yearsOfExperience: v.number(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("consultantProfiles")
      .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!profile) {
      throw new Error("Consultant profile not found");
    }

    await ctx.db.patch(profile._id, {
      yearsOfExperience: args.yearsOfExperience,
      updatedAt: Date.now(),
    });

    return profile._id;
  },
});

// Update spoken languages
export const updateSpokenLanguages = mutation({
  args: {
    clerkUserId: v.string(),
    spokenLanguages: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("consultantProfiles")
      .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!profile) {
      throw new Error("Consultant profile not found");
    }

    await ctx.db.patch(profile._id, {
      spokenLanguages: args.spokenLanguages,
      updatedAt: Date.now(),
    });

    return profile._id;
  },
});

// Get consultants by category
export const getByCategory = query({
  args: {
    categoryId: v.id("categories"),
    limit: v.optional(v.number()),
    minRating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all services in this category
    const services = await ctx.db
      .query("services")
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .collect();

    // Get unique consultant IDs
    const consultantIds = [...new Set(services.map((s) => s.consultantId))];

    // Get consultant profiles
    const consultants = await Promise.all(
      consultantIds.map(async (consultantId) => {
        const profile = await ctx.db
          .query("consultantProfiles")
          .withIndex("byUserId", (q) => q.eq("userId", consultantId))
          .first();

        if (!profile) return null;

        // Apply rating filter
        if (
          args.minRating &&
          profile.averageRating &&
          profile.averageRating < args.minRating
        ) {
          return null;
        }

        const user = await ctx.db.get(consultantId);
        const consultantServices = services.filter(
          (s) => s.consultantId === consultantId
        );

        return {
          profile,
          user: {
            firstName: user?.firstName,
            lastName: user?.lastName,
            imageUrl: user?.imageUrl,
          },
          services: consultantServices,
          serviceCount: consultantServices.length,
        };
      })
    );

    // Filter out null values and apply limit
    let filteredConsultants = consultants.filter(Boolean);

    if (args.limit) {
      filteredConsultants = filteredConsultants.slice(0, args.limit);
    }

    return filteredConsultants;
  },
});

// Get consultants filtered by criteria
export const getFilteredConsultants = query({
  args: {
    minYearsOfExperience: v.optional(v.number()),
    maxYearsOfExperience: v.optional(v.number()),
    spokenLanguages: v.optional(v.array(v.string())),
    minRating: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("consultantProfiles");

    // Apply filters
    const profiles = await query.collect();

    let filteredProfiles = profiles.filter((profile) => {
      // Filter by years of experience
      if (
        args.minYearsOfExperience !== undefined &&
        (profile.yearsOfExperience === undefined ||
          profile.yearsOfExperience < args.minYearsOfExperience)
      ) {
        return false;
      }

      if (
        args.maxYearsOfExperience !== undefined &&
        (profile.yearsOfExperience === undefined ||
          profile.yearsOfExperience > args.maxYearsOfExperience)
      ) {
        return false;
      }

      // Filter by spoken languages (consultant must speak at least one of the requested languages)
      if (args.spokenLanguages && args.spokenLanguages.length > 0) {
        if (!profile.spokenLanguages || profile.spokenLanguages.length === 0) {
          return false;
        }
        const hasCommonLanguage = args.spokenLanguages.some((lang) =>
          profile.spokenLanguages?.includes(lang)
        );
        if (!hasCommonLanguage) {
          return false;
        }
      }

      // Filter by minimum rating
      if (
        args.minRating !== undefined &&
        (profile.averageRating === undefined ||
          profile.averageRating < args.minRating)
      ) {
        return false;
      }

      return true;
    });

    // Apply limit
    if (args.limit) {
      filteredProfiles = filteredProfiles.slice(0, args.limit);
    }

    return filteredProfiles;
  },
});

// Get consultant analytics and performance metrics
export const getAnalytics = query({
  args: {
    userId: v.id("users"),
    dateRange: v.optional(
      v.object({
        startDate: v.string(), // "YYYY-MM-DD"
        endDate: v.string(), // "YYYY-MM-DD"
      })
    ),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("consultantProfiles")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      throw new Error("Consultant profile not found");
    }

    // Get all services
    const services = await ctx.db
      .query("services")
      .withIndex("byConsultantId", (q) => q.eq("consultantId", args.userId))
      .collect();

    // Get all bookings for all services
    const allBookings = [];
    for (const service of services) {
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("byServiceId", (q) => q.eq("serviceId", service._id))
        .collect();
      allBookings.push(
        ...bookings.map((b) => ({ ...b, serviceName: service.name }))
      );
    }

    // Filter by date range if provided
    let filteredBookings = allBookings;
    if (args.dateRange) {
      filteredBookings = allBookings.filter(
        (booking) =>
          booking.date >= args.dateRange!.startDate &&
          booking.date <= args.dateRange!.endDate
      );
    }

    // Calculate metrics
    const totalBookings = filteredBookings.length;
    const completedBookings = filteredBookings.filter(
      (b) => b.status === "completed"
    ).length;
    const cancelledBookings = filteredBookings.filter(
      (b) => b.status === "cancelled"
    ).length;
    const totalRevenue = filteredBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, booking) => {
        const service = services.find((s) => s._id === booking.serviceId);
        return sum + (service?.price || 0);
      }, 0);

    // Booking status distribution
    const statusCounts = filteredBookings.reduce(
      (acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Service popularity
    const serviceStats = services
      .map((service) => {
        const serviceBookings = filteredBookings.filter(
          (b) => b.serviceId === service._id
        );
        return {
          serviceId: service._id,
          serviceName: service.name,
          bookingCount: serviceBookings.length,
          revenue: serviceBookings
            .filter((b) => b.status === "completed")
            .reduce((sum) => sum + service.price, 0),
        };
      })
      .sort((a, b) => b.bookingCount - a.bookingCount);

    // Recent activity
    const recentBookings = filteredBookings
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    return {
      profile,
      dateRange: args.dateRange,
      metrics: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        completionRate:
          totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
        totalRevenue,
        averageRating: profile.averageRating || 0,
        totalReviews: profile.totalReviews || 0,
      },
      statusDistribution: statusCounts,
      serviceStats,
      recentBookings,
    };
  },
});

// Recalculate rating statistics for a consultant (internal function)
export const recalculateRatingStats = internalMutation({
  args: { consultantId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all reviews for this consultant
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("byConsultantId", (q) =>
        q.eq("consultantId", args.consultantId)
      )
      .collect();

    let averageRating = 0;
    const totalReviews = reviews.length;

    if (totalReviews > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      averageRating = Math.round((totalRating / totalReviews) * 10) / 10; // Round to 1 decimal place
    }

    // Update the consultant profile
    const profile = await ctx.db
      .query("consultantProfiles")
      .withIndex("byUserId", (q) => q.eq("userId", args.consultantId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        averageRating,
        totalReviews,
        updatedAt: Date.now(),
      });
    }

    return { averageRating, totalReviews };
  },
});
