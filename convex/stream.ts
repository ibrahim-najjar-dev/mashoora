"use node";

import { StreamClient, UserRequest } from "@stream-io/node-sdk";
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { USER_ROLES } from "../constants/user";
import { api } from "./_generated/api";

const streamApiKey = process.env.streamApiKey;
const streamApiSecret = process.env.streamApiSecret;

if (!streamApiKey || !streamApiSecret) {
  throw new Error("Missing Stream API credentials");
}

const client = new StreamClient(streamApiKey, streamApiSecret, {
  timeout: 3000, // timeout for API requests
});

const STREAM_USER_TOKEN_VALIDITY = 6 * 60 * 60; // 6 hours

export const upsertStreamClientUser = internalAction({
  args: {
    clerkUserId: v.string(),
    phoneNumber: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.string(),
    role: v.union(v.literal(USER_ROLES.USER), v.literal(USER_ROLES.CONSULTANT)),
  },
  handler: async (
    ctx,
    { clerkUserId, firstName, imageUrl, lastName, role }
  ) => {
    try {
      const result = await client.upsertUsers([
        {
          id: clerkUserId,
          name: `${firstName} ${lastName}`,
          image: imageUrl,
          role: role,
        },
      ]);

      // Return a simplified response that only contains Convex-compatible types
      return {
        success: true,
        userId: clerkUserId,
        duration: result.duration,
        // Don't return the full result object as it contains Date objects
      };
    } catch (error) {
      console.error("Error upserting Stream user:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const deleteStreamClientUserByClerkUserId = internalAction({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, { clerkUserId }) => {
    try {
      const result = await client.deleteUsers({ user_ids: [clerkUserId] });
      return {
        success: true,
        userId: clerkUserId,
        duration: result.duration,
      };
    } catch (error) {
      console.error("Error deleting Stream user:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const tokenProvider = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity?.subject) {
      throw new Error("User not authenticated");
    }

    const user = await ctx.runQuery(api.user.getUserByClerkId, {
      clerkUserId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const newUser: UserRequest = {
      id: user?.clerkUserId,
      role: user?.role,
      name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      image: user.imageUrl,
      custom: {
        phoneNumber: user.phonenumber,
      },
    };

    await client.upsertUsers([newUser]);

    console.log("user created");

    const token = client.generateUserToken({
      user_id: user.clerkUserId,
      validity_in_seconds: STREAM_USER_TOKEN_VALIDITY,
    });

    console.log(
      `User ${user.clerkUserId} created with token ${token} and validity ${STREAM_USER_TOKEN_VALIDITY}`
    );

    return token;
  },
});

export const getStreamClientUserToken = internalAction({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, { clerkUserId }) => {
    try {
      const tokenId = await client.generateUserToken({
        user_id: clerkUserId,
        validity_in_seconds: STREAM_USER_TOKEN_VALIDITY,
      });
      return tokenId;
    } catch (error) {
      console.error("Error getting Stream user token:", error);
      throw new Error("Failed to get Stream user token");
    }
  },
});

export const scheduleBookingVideoCall = internalAction({
  args: {
    userClerkUserId: v.string(),
    consultantClerkUserId: v.string(),
    bookingId: v.id("bookings"),
  },
  handler: async (
    ctx,
    { userClerkUserId, consultantClerkUserId, bookingId }
  ) => {
    // Implementation for scheduling a video call
    try {
      const booking = await ctx.runQuery(api.bookings.getBookingById, {
        bookingId: bookingId,
      });

      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      const starts_at = new Date(`${booking.date}T${booking.time}:00Z`);

      console.log(`Booking starts at: ${starts_at.toISOString()}`);

      console.log(`Scheduling video call for booking: ${bookingId}`);
      const call = client.video.call("default", bookingId);
      console.log("Call object created:", call);
      const res = await call.create({
        data: {
          starts_at: starts_at,
          created_by_id: consultantClerkUserId,
          members: [
            { user_id: userClerkUserId },
            { user_id: consultantClerkUserId },
          ],
          settings_override: {
            limits: {
              max_duration_seconds: 5 * 60, // sets the duration to 5 minutes
            },
          },
        },
      });
      console.log("Video call scheduled:", res);
    } catch (error) {
      console.error("Error scheduling video call:", error);
    }
  },
});
