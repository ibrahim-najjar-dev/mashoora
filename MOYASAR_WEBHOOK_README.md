# Moyasar Webhook Integration

This document outlines the Moyasar webhook integration setup and usage in your Convex application.

## Overview

The Moyasar webhook integration allows your application to receive real-time notifications when payment events occur. This enables you to automatically update booking statuses, send confirmations, and handle payment-related workflows.

## Files Created

- `convex/http.ts` - Updated with Moyasar webhook endpoint
- `types/moyasar-webhook.ts` - TypeScript types for webhook payloads
- `lib/moyasar-webhook-utils.ts` - Utility functions for webhook processing

## Setup Instructions

### 1. Configure Webhook in Moyasar Dashboard

1. Go to [Moyasar Dashboard](https://dashboard.moyasar.com/)
2. Log in to your account
3. Navigate to Settings → Webhooks
4. Click "Add Webhook"
5. Configure the following:
   - **Endpoint URL**: `https://your-convex-site.convex.site/moyasar-webhook`
   - **HTTP Method**: POST
   - **Secret Token**: Generate a secure random string (save this for step 2)
   - **Events**: Select the events you want to receive:
     - `payment_paid` - Payment successfully processed
     - `payment_failed` - Payment attempt failed
     - `payment_refunded` - Payment refunded to customer
     - `payment_voided` - Payment canceled/invalidated
     - `payment_authorized` - Payment authorized (funds reserved)
     - `payment_captured` - Authorized payment captured
     - `payment_verified` - Payment details validated

### 2. Configure Environment Variables

Add the following environment variables to your Convex deployment:

```bash
# Moyasar webhook secret token (from step 1)
MOYASAR_WEBHOOK_SECRET=your_webhook_secret_token_here

# Moyasar API credentials (for making API calls back to Moyasar if needed)
MOYASAR_API_KEY=your_moyasar_api_key

# Environment (test or live)
MOYASAR_ENVIRONMENT=test  # or 'live' for production

# DEVELOPMENT ONLY: Skip signature verification during testing
# SECURITY WARNING: Never set this to 'true' in production!
MOYASAR_SKIP_SIGNATURE_VERIFICATION=true  # Remove this in production
```

To add these variables:

```bash
npx convex env set MOYASAR_WEBHOOK_SECRET your_webhook_secret_token_here
npx convex env set MOYASAR_API_KEY your_moyasar_api_key
npx convex env set MOYASAR_ENVIRONMENT test
```

### 3. Deploy Your Changes

Deploy your updated Convex functions:

```bash
npx convex deploy
```

### 4. Test the Webhook

1. Make a test payment through your application
2. Check the Convex logs to see if the webhook was received and processed
3. Verify that the appropriate business logic was triggered

## Webhook Events and Business Logic

The webhook handler processes the following events:

### `payment_paid`

- **Trigger**: Payment successfully processed
- **TODO Actions**:
  - Update booking status to confirmed
  - Send confirmation email/SMS to user
  - Update payment record in database
  - Trigger post-payment workflows

### `payment_failed`

- **Trigger**: Payment attempt failed
- **TODO Actions**:
  - Update booking status to failed
  - Send failure notification to user
  - Log failure reason for analysis
  - Offer alternative payment methods

### `payment_refunded`

- **Trigger**: Payment refunded to customer
- **TODO Actions**:
  - Update booking status to refunded
  - Send refund confirmation to user
  - Update financial records
  - Handle booking cancellation logic

### `payment_voided`

- **Trigger**: Payment canceled/invalidated
- **TODO Actions**:
  - Cancel associated booking
  - Free up consultant availability
  - Send cancellation notification
  - Update payment status

### `payment_authorized`

- **Trigger**: Payment authorized (funds reserved)
- **TODO Actions**:
  - Mark payment as authorized but not captured
  - Reserve booking slot
  - Set booking status to pending capture
  - Send authorization confirmation

### `payment_captured`

- **Trigger**: Authorized payment captured
- **TODO Actions**:
  - Confirm the booking
  - Update payment status to captured
  - Send booking confirmation
  - Similar to payment_paid but for two-step payments

### `payment_verified`

- **Trigger**: Payment details validated
- **TODO Actions**:
  - Update verification status
  - Proceed with verification-dependent workflows
  - Send verification confirmation if needed

## Security Considerations

### Webhook Signature Verification (HMAC)

**What is HMAC Signature Verification?**

HMAC (Hash-based Message Authentication Code) is a crucial security mechanism that ensures:

- The webhook actually came from Moyasar (not a malicious actor)
- The payload hasn't been tampered with during transmission
- The request is authentic and not a replay attack

**Current Implementation Status:**

The webhook handler includes a temporary HMAC implementation because Moyasar's documentation doesn't specify:

- The exact hashing algorithm (SHA-256, SHA-1, etc.)
- The header name for the signature (e.g., `x-moyasar-signature`)
- The signature format (hex, base64, etc.)

**How to Complete the Implementation:**

1. **Test with Moyasar**: Send a test webhook and inspect the headers to identify:

   ```
   x-moyasar-signature: sha256=abc123...
   x-webhook-signature: abc123...
   signature: abc123...
   ```

2. **Contact Moyasar Support**: Ask for their webhook signature implementation details

3. **Update the Implementation**: Replace the temporary `generateHMACSignature` function with the correct algorithm

**Development Mode:**

For testing, you can skip signature verification by setting:

```bash
MOYASAR_SKIP_SIGNATURE_VERIFICATION=true
```

⚠️ **SECURITY WARNING**: Never skip signature verification in production!

**Example of Proper HMAC Implementation** (once confirmed):

```typescript
function generateHMACSignature(payload: string, secret: string): string {
  const crypto = require("crypto");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
```

3. Update the header names in the validation function

### IP Whitelisting (Optional)

Consider implementing IP whitelisting to only accept webhooks from Moyasar's servers.

### Timestamp Validation

The utility functions include timestamp validation to prevent replay attacks.

## Error Handling

The webhook implementation includes:

- Request validation
- JSON parsing error handling
- Event type validation
- Graceful error responses
- Comprehensive logging

## Monitoring and Debugging

### Logs to Monitor

- Webhook reception logs
- Validation failures
- Processing errors
- Business logic execution

### Common Issues

1. **Invalid webhook signature**: Check secret token configuration
2. **Unsupported event types**: Verify event configuration in Moyasar Dashboard
3. **Processing timeouts**: Monitor function execution times
4. **Database update failures**: Check database connectivity and permissions

## Next Steps

1. **Implement Signature Verification**: Complete the webhook security implementation
2. **Add Business Logic**: Implement the TODO items in each event handler
3. **Create Database Mutations**: Add the necessary Convex mutations for updating bookings and payments
4. **Add Notification System**: Implement email/SMS notifications for users
5. **Add Monitoring**: Set up alerts for webhook failures
6. **Add Testing**: Create unit tests for webhook processing logic

## Testing

### Manual Testing

1. Use Moyasar's test environment to create test payments
2. Monitor Convex logs for webhook reception
3. Verify business logic execution

### Automated Testing

Consider creating tests for:

- Webhook payload validation
- Event processing logic
- Error handling scenarios
- Signature verification

## Support

- [Moyasar Documentation](https://docs.moyasar.com/)
- [Moyasar Webhook Guide](https://docs.moyasar.com/guides/dashboard/setting-up-webhooks)
- [Convex HTTP Actions Documentation](https://docs.convex.dev/functions/http-actions)
