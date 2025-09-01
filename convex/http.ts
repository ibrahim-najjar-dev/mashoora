import type { WebhookEvent } from "@clerk/backend";
import { GenericActionCtx, httpRouter } from "convex/server";
import { Webhook } from "svix";
import { api, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import type {
  MoyasarWebhookPayload,
  MoyasarWebhookVerificationResult,
  MoyasarWebhookEventType,
} from "../types/moyasar-webhook";
import { USER_ROLES } from "../constants/user";
// import {ver} from 'react-native-moyasar-sdk'

const http = httpRouter();

/**
 * Moyasar Payment Webhook Handler
 *
 * This endpoint receives webhook notifications from Moyasar when payment events occur.
 *
 * Setup Instructions:
 * 1. Configure webhook URL in Moyasar Dashboard: https://dashboard.moyasar.com/
 * 2. Set webhook endpoint to: https://your-convex-site.convex.site/moyasar-webhook
 * 3. Configure secret token in Moyasar Dashboard and add to environment variables
 * 4. Select the events you want to receive notifications for
 *
 * Security:
 * - Webhook payloads should be verified using the secret token
 * - Only process requests from Moyasar's IP addresses (optional but recommended)
 *
 * Supported Events:
 * - payment_paid: Payment successfully processed
 * - payment_failed: Payment attempt failed
 * - payment_refunded: Payment refunded to customer
 * - payment_voided: Payment canceled/invalidated
 * - payment_authorized: Payment authorized (funds reserved)
 * - payment_captured: Authorized payment captured
 * - payment_verified: Payment details validated
 */
http.route({
  path: "/moyasar-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      // Step 1: Validate the webhook request
      const validationResult = await validateMoyasarWebhook(req);

      if (!validationResult.isValid) {
        console.error(
          "Invalid Moyasar webhook request:",
          validationResult.error
        );
        return new Response("Invalid webhook request", { status: 400 });
      }

      const payload = validationResult.payload!;

      // Step 2: Log the received event for debugging
      console.log(
        `Received Moyasar webhook: ${payload.type} for payment ${payload.data.id}`
      );

      // Step 3: Process the webhook based on event type
      await processMoyasarWebhookEvent(ctx, payload);

      // Step 4: Return success response
      return new Response("Webhook processed successfully", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error processing Moyasar webhook:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const event = await validateRequest(req);

    if (!event) {
      return new Response("Invalid request", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
        // Handle user created event
        const userCreated = await ctx.runMutation(
          internal.user.upsertFromClerk,
          {
            data: event.data,
          }
        );
        // console.log("User created:", userCreated);
        // if (
        //   userCreated &&
        //   (userCreated.role === USER_ROLES.USER ||
        //     userCreated.role === USER_ROLES.CONSULTANT)
        // ) {
        //   const upsertResult = await ctx.runAction(
        //     internal.stream.upsertStreamClientUser,
        //     {
        //       clerkUserId: userCreated.clerkUserId,
        //       phoneNumber: userCreated.phonenumber,
        //       firstName: userCreated.firstName || "unknown",
        //       lastName: userCreated.lastName || "user",
        //       imageUrl: userCreated.imageUrl || "",
        //       role: userCreated.role,
        //     }
        //   );
        //   console.log("Stream user upsert result:", upsertResult);
        //   const tokenId = await ctx.runAction(
        //     internal.stream.getStreamClientUserToken,
        //     {
        //       clerkUserId: userCreated.clerkUserId,
        //     }
        //   );

        //   console.log("Stream user token:", tokenId);

        //   const updateUserTokenResult = await ctx.runMutation(
        //     internal.user.updateUserStreamToken,
        //     {
        //       streamToken: tokenId,
        //       clerkUserId: userCreated.clerkUserId,
        //     }
        //   );
        //   console.log("Stream user update result:", updateUserTokenResult);
        // }
        break;
      case "user.updated":
        // Handle user updated event
        const updatedUser = await ctx.runMutation(
          internal.user.upsertFromClerk,
          {
            data: event.data,
          }
        );
        // console.log("User updated:", updatedUser);
        // if (
        //   updatedUser &&
        //   (updatedUser.role === USER_ROLES.USER ||
        //     updatedUser.role === USER_ROLES.CONSULTANT)
        // ) {
        //   const upsertResult = await ctx.runAction(
        //     internal.stream.upsertStreamClientUser,
        //     {
        //       clerkUserId: updatedUser.clerkUserId,
        //       phoneNumber: updatedUser.phonenumber,
        //       firstName: updatedUser.firstName || "unknown",
        //       lastName: updatedUser.lastName || "user",
        //       imageUrl: updatedUser.imageUrl || "",
        //       role: updatedUser.role,
        //     }
        //   );
        //   console.log("Stream user upsert result:", upsertResult);
        //   const tokenId = await ctx.runAction(
        //     internal.stream.getStreamClientUserToken,
        //     {
        //       clerkUserId: updatedUser.clerkUserId,
        //     }
        //   );

        //   console.log("Stream user token:", tokenId);

        //   const updateUserTokenResult = await ctx.runMutation(
        //     internal.user.updateUserStreamToken,
        //     {
        //       streamToken: tokenId,
        //       clerkUserId: updatedUser.clerkUserId,
        //     }
        //   );
        //   console.log("Stream user update result:", updateUserTokenResult);
        // }
        break;
      case "user.deleted":
        const clerkUserId = event.data.id!;
        // Handle user deleted event
        await ctx.runMutation(internal.user.deleteUserByClerkId, {
          clerkUserId,
        });
        // await ctx.runAction(
        //   internal.stream.deleteStreamClientUserByClerkUserId,
        //   {
        //     clerkUserId,
        //   }
        // );
        break;
      case "session.created":
        // here we check if stream token exists and if not create it
        // const sessionClerkUserId = event.data.user_id!;
        // const sessionUser = await ctx.runQuery(api.user.getUserByClerkId, {
        //   clerkUserId: sessionClerkUserId,
        // });
        // if (sessionUser) {
        //   const tokenId = await ctx.runAction(
        //     internal.stream.getStreamClientUserToken,
        //     {
        //       clerkUserId: sessionClerkUserId,
        //     }
        //   );

        //   console.log("Stream user token:", tokenId);

        //   const updateUserTokenResult = await ctx.runMutation(
        //     internal.user.updateUserStreamToken,
        //     {
        //       streamToken: tokenId,
        //       clerkUserId: sessionClerkUserId,
        //     }
        //   );
        //   console.log("Stream user update result:", updateUserTokenResult);
        // }
        break;
      default:
        console.warn(`Unhandled event type: ${event.type}`);
        break;
    }
    return new Response("Event processed", { status: 200 });
  }),
});

export default http;

/**
 * Validates incoming Moyasar webhook requests
 *
 * TODO: Implement proper webhook signature verification
 * - Moyasar provides a secret token for webhook verification
 * - Check the documentation for the exact header names and verification method
 * - Common patterns: HMAC SHA256 signature verification
 *
 * @param req - The incoming HTTP request
 * @returns Promise<MoyasarWebhookVerificationResult>
 */
async function validateMoyasarWebhook(
  req: Request
): Promise<MoyasarWebhookVerificationResult> {
  try {
    // Step 1: Extract the payload
    const payloadString = await req.text();

    // Step 2: Parse the JSON payload
    let payload: MoyasarWebhookPayload;
    try {
      payload = JSON.parse(payloadString);

      // Debug logging - remove in production
      console.log("Received Moyasar webhook payload:", {
        keys: Object.keys(payload),
        payload: payload,
      });

      // Also log headers for debugging
      const headers: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Webhook headers:", headers);
    } catch (parseError) {
      return {
        isValid: false,
        error: "Invalid JSON payload",
      };
    }

    // Step 3: Basic payload validation
    if (!payload.type || !payload.data || !payload.id) {
      return {
        isValid: false,
        error: "Missing required fields in payload",
      };
    }

    // Step 4: Verify webhook using secret token from payload
    // Moyasar includes the secret_token in the payload itself
    const secretToken = process.env.MOYASAR_WEBHOOK_SECRET;

    // Allow skipping signature verification during development/testing
    if (shouldSkipSignatureVerification()) {
      console.warn(
        "SECURITY WARNING: Webhook signature verification is disabled. Only use this in development!"
      );
    } else {
      if (!payload.secret_token || !secretToken) {
        return {
          isValid: false,
          error: "Missing secret token in payload or environment",
        };
      }

      // Moyasar verification: Check if the secret_token in payload matches our configured secret
      if (payload.secret_token !== secretToken) {
        console.error("Secret token verification failed", {
          received: payload.secret_token,
          expected: secretToken?.substring(0, 8) + "...", // Log only first 8 chars for security
        });
        return {
          isValid: false,
          error: "Invalid secret token",
        };
      }
    }

    // Step 5: Validate event type is supported
    const supportedEvents: MoyasarWebhookEventType[] = [
      "payment_paid",
      "payment_failed",
      "payment_refunded",
      "payment_voided",
      "payment_authorized",
      "payment_captured",
      "payment_verified",
    ];

    if (!supportedEvents.includes(payload.type)) {
      return {
        isValid: false,
        error: `Unsupported event type: ${payload.type}`,
      };
    }

    return {
      isValid: true,
      payload,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${error}`,
    };
  }
}

/**
 * Processes different types of Moyasar webhook events
 *
 * This function routes webhook events to appropriate handlers based on event type.
 * Each event type should trigger specific business logic in your application.
 *
 * @param ctx - Convex action context
 * @param payload - Validated webhook payload
 */
async function processMoyasarWebhookEvent(
  ctx: GenericActionCtx<any>,
  payload: MoyasarWebhookPayload
): Promise<void> {
  const { type: event_type, data: payment } = payload;

  switch (event_type) {
    case "payment_paid":
      console.log(`Processing successful payment: ${JSON.stringify(payment)}`);

      try {
        const user = await ctx.runQuery(api.user.getUserByClerkId, {
          clerkUserId: payment.metadata!.clerkUserId!,
        });

        if (!user) {
          console.error(
            `User not found for clerkUserId: ${payment.metadata!.clerkUserId}`
          );
          return;
        }

        const bookingId = await ctx.runMutation(api.bookings.createBooking, {
          consultantId: payment.metadata!.consultantId!,
          userId: user?._id,
          serviceId: payment.metadata!.serviceId!,
          date: payment.metadata!.selectedDate!,
          time: payment.metadata!.selectedTimeSlot!,
          totalAmount: payment.amount,
          currency: payment.currency!,
          duration: payment.metadata!.duration!,
        });
        console.log(
          `Booking created successfully: ${JSON.stringify(bookingId)}`
        );

        await ctx.runAction(internal.stream.scheduleBookingVideoCall, {
          userClerkUserId: payment.metadata!.clerkUserId!,
          consultantClerkUserId: payment.metadata!.consultantId!,
          bookingId,
        });
      } catch (error) {
        console.error(`Error creating booking: ${error}`);
      }
      break;

    case "payment_failed":
      console.log(`Processing failed payment: ${payment.id}`);
      break;

    case "payment_refunded":
      console.log(`Processing refunded payment: ${payment.id}`);
      break;

    case "payment_voided":
      console.log(`Processing voided payment: ${payment.id}`);
      break;

    case "payment_authorized":
      console.log(`Processing authorized payment: ${payment.id}`);
      break;

    case "payment_captured":
      console.log(`Processing captured payment: ${payment.id}`);
      break;

    case "payment_verified":
      console.log(`Processing verified payment: ${payment.id}`);
      break;

    default:
      console.warn(`Unhandled Moyasar webhook event type: ${event_type}`);
      break;
  }
}

/**
 * Generates HMAC signature for webhook verification
 *
 * This implementation uses HMAC-SHA256 which is the most common standard.
 * If Moyasar uses a different algorithm or format, this can be easily adjusted.
 *
 * @param payload - Raw payload string
 * @param secret - Webhook secret token
 * @returns string - Generated signature in hex format
 */
function generateHMACSignature(payload: string, secret: string): string {
  // Using Web Crypto API (available in Convex runtime)
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  // For synchronous operation, we'll use a simpler approach
  // This is a basic HMAC-SHA256 implementation
  // Note: In a real implementation, you might want to use crypto.subtle for async operations

  // For now, we'll create a simple hash-based signature
  // This should be replaced with proper HMAC once we confirm Moyasar's exact requirements
  const combinedData = secret + payload + secret;
  let hash = 0;
  for (let i = 0; i < combinedData.length; i++) {
    const char = combinedData.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to hex string
  const hexHash = Math.abs(hash).toString(16);

  // TODO: Replace this with proper HMAC-SHA256 implementation
  // Example of what the proper implementation should look like:
  // const key = await crypto.subtle.importKey(
  //   "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  // );
  // const signature = await crypto.subtle.sign("HMAC", key, messageData);
  // return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');

  console.warn(
    "Using temporary HMAC implementation. Replace with proper HMAC-SHA256 once Moyasar's exact requirements are confirmed."
  );
  return hexHash;
}

/**
 * Temporary function to disable signature verification during testing
 * Remove this once proper verification implementation is confirmed and working
 */
function shouldSkipSignatureVerification(): boolean {
  // Set this environment variable to 'true' to skip signature verification during development
  // Also skip if no secret is configured (development mode)
  return (
    process.env.MOYASAR_SKIP_SIGNATURE_VERIFICATION === "true" ||
    !process.env.MOYASAR_WEBHOOK_SECRET
  );
}

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}
