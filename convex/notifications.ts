// convex/example.ts
import { PushNotifications } from "@convex-dev/expo-push-notifications";
import { api, components, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const pushNotifications = new PushNotifications<Id<"users">>(
  components.pushNotifications,
  { logLevel: "DEBUG" }
);

export const recordPushNotificationToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.runQuery(api.user.current);
      if (!user) {
        throw new Error("User not found");
      }
      await pushNotifications.recordToken(ctx, {
        userId: user._id,
        pushToken: args.token,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Failed to fetch user");
    }
  },
});
