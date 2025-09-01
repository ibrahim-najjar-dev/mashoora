import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Get reviews for a consultant
export const getByConsultantId = query({
  args: {
    consultantId: v.id("users"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("reviews")
      .withIndex("byConsultantId", (q) =>
        q.eq("consultantId", args.consultantId)
      )
      .order("desc");

    const reviews = args.limit
      ? await query.take(args.limit)
      : await query.collect();

    // Get user details for each review
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          user: {
            firstName: user?.firstName,
            lastName: user?.lastName,
            imageUrl: user?.imageUrl,
          },
        };
      })
    );

    return reviewsWithUsers;
  },
});

// Get reviews by a specific user
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Get consultant details for each review
    const reviewsWithConsultants = await Promise.all(
      reviews.map(async (review) => {
        const consultant = await ctx.db.get(review.consultantId);
        return {
          ...review,
          consultant: {
            firstName: consultant?.firstName,
            lastName: consultant?.lastName,
            imageUrl: consultant?.imageUrl,
          },
        };
      })
    );

    return reviewsWithConsultants;
  },
});

// Create a new review
export const createReview = mutation({
  args: {
    userId: v.id("users"),
    consultantId: v.id("users"),
    bookingId: v.optional(v.id("bookings")),
    rating: v.number(),
    comment: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate rating is between 1 and 5
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user already reviewed this consultant for this booking
    if (args.bookingId) {
      const existingReview = await ctx.db
        .query("reviews")
        .withIndex("byBookingId", (q) => q.eq("bookingId", args.bookingId))
        .first();

      if (existingReview) {
        throw new Error("Review already exists for this booking");
      }
    }

    const now = Date.now();
    const reviewId = await ctx.db.insert("reviews", {
      userId: args.userId,
      consultantId: args.consultantId,
      bookingId: args.bookingId,
      rating: args.rating,
      comment: args.comment,
      isVerified: args.isVerified || false,
      createdAt: now,
      updatedAt: now,
    });

    // Trigger recalculation of consultant rating stats
    await ctx.runMutation(internal.consultantProfiles.recalculateRatingStats, {
      consultantId: args.consultantId,
    });

    return reviewId;
  },
});

// Update a review
export const updateReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    rating: v.optional(v.number()),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Validate rating if provided
    if (args.rating !== undefined && (args.rating < 1 || args.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (args.rating !== undefined) {
      updateData.rating = args.rating;
    }

    if (args.comment !== undefined) {
      updateData.comment = args.comment;
    }

    await ctx.db.patch(args.reviewId, updateData);

    // Recalculate consultant rating stats if rating was updated
    if (args.rating !== undefined) {
      await ctx.runMutation(
        internal.consultantProfiles.recalculateRatingStats,
        {
          consultantId: review.consultantId,
        }
      );
    }

    return args.reviewId;
  },
});

// Delete a review
export const deleteReview = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    await ctx.db.delete(args.reviewId);

    // Recalculate consultant rating stats
    await ctx.runMutation(internal.consultantProfiles.recalculateRatingStats, {
      consultantId: review.consultantId,
    });

    return true;
  },
});

// Get rating statistics for a consultant
export const getRatingStats = query({
  args: { consultantId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("byConsultantId", (q) =>
        q.eq("consultantId", args.consultantId)
      )
      .collect();

    const totalReviews = reviews.length;
    let averageRating = 0;

    // Rating distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    if (totalReviews > 0) {
      const totalRating = reviews.reduce((sum, review) => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
        return sum + review.rating;
      }, 0);

      averageRating = Math.round((totalRating / totalReviews) * 10) / 10;
    }

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
      recentReviews: reviews.slice(0, 5), // Last 5 reviews
    };
  },
});

// Get reviews for a specific booking
export const getByBookingId = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const review = await ctx.db
      .query("reviews")
      .withIndex("byBookingId", (q) => q.eq("bookingId", args.bookingId))
      .first();

    if (review) {
      const user = await ctx.db.get(review.userId);
      const consultant = await ctx.db.get(review.consultantId);

      return {
        ...review,
        user: {
          firstName: user?.firstName,
          lastName: user?.lastName,
          imageUrl: user?.imageUrl,
        },
        consultant: {
          firstName: consultant?.firstName,
          lastName: consultant?.lastName,
          imageUrl: consultant?.imageUrl,
        },
      };
    }

    return null;
  },
});
