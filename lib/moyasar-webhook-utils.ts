/**
 * Moyasar Webhook Utilities
 *
 * This file contains utility functions for handling Moyasar webhook operations.
 * These can be imported and used in various parts of your application.
 */

import type {
  MoyasarWebhookEventType,
  MoyasarPayment,
} from "../types/moyasar-webhook";

/**
 * Environment variables needed for Moyasar webhook integration
 *
 * Add these to your Convex environment variables:
 * - MOYASAR_WEBHOOK_SECRET: Secret token from Moyasar Dashboard
 * - MOYASAR_API_KEY: Your Moyasar API key (for making API calls back to Moyasar)
 * - MOYASAR_ENVIRONMENT: 'test' or 'live' depending on your environment
 */

/**
 * Moyasar webhook configuration constants
 */
export const MOYASAR_WEBHOOK_CONFIG = {
  // Timeout for webhook processing (in milliseconds)
  PROCESSING_TIMEOUT: 30000,

  // Maximum number of retry attempts for failed webhook processing
  MAX_RETRY_ATTEMPTS: 3,

  // Webhook signature header name (TODO: Update based on Moyasar docs)
  SIGNATURE_HEADER: "x-moyasar-signature",

  // Webhook timestamp header name (TODO: Update based on Moyasar docs)
  TIMESTAMP_HEADER: "x-moyasar-timestamp",
} as const;

/**
 * Helper function to determine if a payment event requires immediate action
 *
 * @param eventType - The webhook event type
 * @returns boolean - True if immediate action is required
 */
export function requiresImmediateAction(
  eventType: MoyasarWebhookEventType
): boolean {
  const urgentEvents: MoyasarWebhookEventType[] = [
    "payment_paid",
    "payment_failed",
    "payment_refunded",
  ];

  return urgentEvents.includes(eventType);
}

/**
 * Helper function to determine if a payment is in a final state
 *
 * @param payment - The payment object
 * @returns boolean - True if payment is in a final state
 */
export function isPaymentFinal(payment: MoyasarPayment): boolean {
  const finalStates = ["paid", "failed", "refunded", "voided"];
  return finalStates.includes(payment.status);
}

/**
 * Helper function to extract booking/order ID from payment metadata
 *
 * @param payment - The payment object
 * @returns string | null - The booking ID if found
 */
export function extractBookingId(payment: MoyasarPayment): string | null {
  // TODO: Implement based on how you store booking IDs in payment metadata
  // Common patterns:
  // - payment.metadata?.booking_id
  // - payment.metadata?.order_id
  // - payment.description (if you encode booking ID there)

  if (payment.metadata?.booking_id) {
    return payment.metadata.booking_id;
  }

  if (payment.metadata?.order_id) {
    return payment.metadata.order_id;
  }

  // Extract from description if it follows a pattern like "Booking #12345"
  const descriptionMatch = payment.description?.match(/booking[#\s]*(\w+)/i);
  if (descriptionMatch) {
    return descriptionMatch[1];
  }

  return null;
}

/**
 * Helper function to format webhook event for logging
 *
 * @param eventType - The webhook event type
 * @param payment - The payment object
 * @returns string - Formatted log message
 */
export function formatWebhookLog(
  eventType: MoyasarWebhookEventType,
  payment: MoyasarPayment
): string {
  const bookingId = extractBookingId(payment);
  const bookingInfo = bookingId ? ` (Booking: ${bookingId})` : "";

  return `Moyasar Webhook: ${eventType} - Payment ${payment.id} (${payment.status}) - Amount: ${payment.amount} ${payment.currency}${bookingInfo}`;
}

/**
 * Helper function to validate webhook timestamp (prevent replay attacks)
 *
 * @param timestamp - Timestamp from webhook headers
 * @param toleranceSeconds - Maximum age of webhook in seconds (default: 300 = 5 minutes)
 * @returns boolean - True if timestamp is valid
 */
export function isValidWebhookTimestamp(
  timestamp: string,
  toleranceSeconds: number = 300
): boolean {
  try {
    const webhookTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const timeDifference = Math.abs(currentTime - webhookTime) / 1000;

    return timeDifference <= toleranceSeconds;
  } catch (error) {
    console.error("Error validating webhook timestamp:", error);
    return false;
  }
}

/**
 * Helper function to sanitize webhook payload for logging
 * (removes sensitive information)
 *
 * @param payment - The payment object
 * @returns Partial<MoyasarPayment> - Sanitized payment object
 */
export function sanitizePaymentForLogging(
  payment: MoyasarPayment
): Partial<MoyasarPayment> {
  return {
    id: payment.id,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    created_at: payment.created_at,
    updated_at: payment.updated_at,
    // Exclude sensitive metadata or payment details
  };
}
