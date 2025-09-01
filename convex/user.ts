import { UserJSON, createClerkClient } from "@clerk/backend";
import { v, Validator } from "convex/values";
import { USER_ROLES } from "../constants/user";
import {
  action,
  internalMutation,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { api, internal } from "./_generated/api";

export const getUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    return await userByClerkUserId(ctx, clerkUserId);
  },
});

export const deleteUserByClerkId = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const user = await userByClerkUserId(ctx, clerkUserId);
    if (user) {
      await ctx.db.delete(user._id);
    }
    return null;
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const userRole =
      typeof data.public_metadata.role === "string"
        ? data.public_metadata.role
        : USER_ROLES.USER;

    const onBoardingCompleted =
      typeof data.public_metadata.onBoardingCompleted === "boolean"
        ? data.public_metadata.onBoardingCompleted
        : false;

    const userAttributes = {
      phonenumber: data.phone_numbers[0].phone_number,
      clerkUserId: data.id,
      firstName: data.first_name ?? undefined,
      lastName: data.last_name ?? undefined,
      imageUrl: data.image_url ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      role: userRole,
      onBoardingCompleted,
    };

    const user = await userByClerkUserId(ctx, data.id);

    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }

    return await userByClerkUserId(ctx, data.id);
  },
});

export const updateUserStreamToken = internalMutation({
  args: { streamToken: v.string(), clerkUserId: v.string() },
  handler: async (ctx, { streamToken, clerkUserId }) => {
    const user = await userByClerkUserId(ctx, clerkUserId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { streamToken });
    return { success: true };
  },
});

export const updateClerkUserRole = action({
  args: {
    role: v.union(v.literal(USER_ROLES.USER), v.literal(USER_ROLES.CONSULTANT)),
  },
  async handler(ctx, { role }) {
    // Get the authenticated user's identity

    console.log("User identity:");
    const identity = await ctx.auth.getUserIdentity();

    console.log(identity);

    if (!identity) {
      throw new Error("User not authenticated");
    }

    // Create Clerk client instance
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
      // Update the user's role in Clerk's public metadata
      await clerkClient.users.updateUserMetadata(identity.subject, {
        publicMetadata: {
          role: role,
        },
      });

      return { success: true, role: role };
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error("Failed to update user role");
    }
  },
});

// User Preferences Queries and Mutations
export const getUserPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const user = await userByClerkUserId(ctx, identity.subject);
    if (!user) {
      throw new Error("User not found");
    }

    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .first();

    if (!preferences) {
      return null;
    }

    // Get the category details for the selected categories
    const categories = await Promise.all(
      preferences.categoryIds.map(async (categoryId) => {
        return await ctx.db.get(categoryId);
      })
    );

    return {
      ...preferences,
      categories: categories.filter(Boolean), // Filter out any null values
    };
  },
});

export const updateUserPreferences = mutation({
  args: {
    categoryIds: v.array(v.id("categories")),
  },
  handler: async (ctx, { categoryIds }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const user = await userByClerkUserId(ctx, identity.subject);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user preferences already exist
    const existingPreferences = await ctx.db
      .query("userPreferences")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();

    if (existingPreferences) {
      // Update existing preferences
      await ctx.db.patch(existingPreferences._id, {
        categoryIds,
        updatedAt: now,
      });
      return existingPreferences._id;
    } else {
      // Create new preferences
      const preferencesId = await ctx.db.insert("userPreferences", {
        userId: user._id,
        clerkUserId: identity.subject,
        categoryIds,
        createdAt: now,
        updatedAt: now,
      });
      return preferencesId;
    }
  },
});

export const completeOnboarding = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const user = await ctx.runQuery(api.user.getUserByClerkId, {
      clerkUserId: identity.subject,
    });
    if (!user) {
      throw new Error("User not found");
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
      await clerkClient.users.updateUserMetadata(identity.subject, {
        publicMetadata: {
          onBoardingCompleted: true,
        },
      });
    } catch (error) {
      console.error("Error updating Clerk metadata:", error);
      // Don't throw here since the database update succeeded
    }

    return { success: true };
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  // identity.subject is the Clerk user ID
  return await userByClerkUserId(ctx, identity.subject);
}

async function userByClerkUserId(ctx: QueryCtx, clerkUserId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();
}
