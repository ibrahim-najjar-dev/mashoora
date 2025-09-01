/**
 * Moyasar Webhook Types
 * Based on Moyasar API documentation: https://docs.moyasar.com/guides/dashboard/setting-up-webhooks
 */

// Available webhook events from Moyasar
export type MoyasarWebhookEventType =
  | "payment_paid"
  | "payment_failed"
  | "payment_refunded"
  | "payment_voided"
  | "payment_authorized"
  | "payment_captured"
  | "payment_verified";

// Moyasar payment status types
export type MoyasarPaymentStatus =
  | "paid"
  | "failed"
  | "pending"
  | "authorized"
  | "captured"
  | "voided"
  | "refunded"
  | "verified";

// Base payment object structure based on actual Moyasar API response
export interface MoyasarPayment {
  id: string;
  status: MoyasarPaymentStatus;
  amount: number;
  fee: number;
  currency: string;
  refunded: number;
  refunded_at: string | null;
  captured: number;
  captured_at: string | null;
  voided_at: string | null;
  description?: string;
  amount_format: string;
  fee_format: string;
  refunded_format: string;
  captured_format: string;
  invoice_id?: string | null;
  ip: string;
  callback_url: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any> | null;
  source?: {
    type: string;
    company: string;
    name: string;
    number: string;
    gateway_id: string;
    reference_number: string;
    token: string | null;
    message: string;
    transaction_url: string | null;
    response_code: string;
    authorization_code: string;
    issuer_name: string;
    issuer_country: string;
    issuer_card_type: string;
    issuer_card_category: string;
  };
}

// Webhook payload structure based on Moyasar documentation
export interface MoyasarWebhookPayload {
  id: string; // The event's unique ID
  type: MoyasarWebhookEventType; // The type of the event (payment_paid, etc.)
  created_at: string; // The time the webhook object was created
  secret_token: string; // The endpoint's secret assigned by the consumer
  account_name: string | null; // The name of the account in which the event occurred (can be null)
  live: boolean; // True if payment is in live mode, false if test mode
  data: MoyasarPayment; // The Payment payload associated with the event
}

// Webhook verification result
export interface MoyasarWebhookVerificationResult {
  isValid: boolean;
  payload?: MoyasarWebhookPayload;
  error?: string;
}
