import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Public queries
export const getBookingsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getBookingsWithServiceDataByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.user.getUserByClerkId, {
      clerkUserId: args.clerkUserId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // add bookings with service title

    const bookings: Doc<"bookings">[] = await ctx.db
      .query("bookings")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const bookingsWithService = await Promise.all(
      bookings.map(async (booking) => {
        const service = await ctx.db.get(booking.serviceId);

        if (!service) {
          throw new Error("Service not found for booking " + booking._id);
        }
        const consultantUserProfile = await ctx.db.get(service.consultantId);
        return {
          ...booking,
          service, // or pick specific fields: serviceName: service?.name
          consultantUserProfile,
        };
      })
    );

    return bookingsWithService;
  },
});

export const getBookingById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookingId);
  },
});

export const getDetailedBookingDataById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const service = await ctx.db.get(booking.serviceId);
    const user = await ctx.db.get(booking.userId);

    return {
      ...booking,
      service,
      user,
    };
  },
});

// Public mutations
export const createBooking = mutation({
  args: {
    userId: v.id("users"),
    serviceId: v.id("services"),
    consultantId: v.id("users"),
    date: v.string(),
    time: v.string(),
    duration: v.number(),
    totalAmount: v.number(),
    currency: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const bookingId = await ctx.db.insert("bookings", {
      userId: args.userId,
      serviceId: args.serviceId,
      date: args.date,
      time: args.time,
      duration: args.duration,
      currency: args.currency,
      status: "pending_payment",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return bookingId;
  },
});
