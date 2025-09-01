// "use node";

// import { v } from "convex/values";
// import { internalMutation, internalQuery } from "./_generated/server";

// export const createPayoutAcoount = internalMutation({
//   args: {
//     account_type: v.union(v.literal("bank"), v.literal("wallet")),
//     properties: v.object({
//       iban: v.string(),
//     }),
//   },
//   handler: async (ctx, { account_type, properties }) => {
//     return {
//       id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//       account_type,
//       currency: "SAR",
//       properties,
//       created_at: new Date().toISOString(),
//     };
//   },
// });

// export const ListPayoutAccounts = internalQuery({
//   handler: async (ctx) => {
//     const res = {
//       payout_accounts: [
//         {
//           id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//           account_type: "bank",
//           currency: "SAR",
//           properties: {
//             iban: "SA8430400108057386290038",
//           },
//           created_at: "Date and time when the payout account was created.",
//         },
//       ],
//       meta: {
//         current_page: 1,
//         next_page: null,
//         prev_page: null,
//         total_pages: 1,
//         total_count: 1,
//       },
//     };
//     return res;
//   },
// });

// export const fetchPayoutAccount = internalQuery({
//   args: {
//     id: v.string(),
//   },
//   handler: async (ctx, { id }) => {
//     const res = {
//       id,
//       account_type: "bank",
//       currency: "SAR",
//       properties: {
//         iban: "SA8430400108057386290038",
//       },
//       created_at: "Date and time when the payout account was created.",
//     };
//     return res;
//   },
// });

// export const createPayout = internalMutation({
//   args: {
//     sourceAccountId: v.string(),
//     amount: v.number(),
//     consultantClerkUserId: v.string(),
//     clientClerkUserId: v.string(),
//     serviceId: v.string(),
//   },
//   handler: async (
//     ctx,
//     {
//       sourceAccountId,
//       amount,
//       clientClerkUserId,
//       consultantClerkUserId,
//       serviceId,
//     }
//   ) => {
//     const body = {
//       source__id: sourceAccountId,
//       amount,
//       purpose: "payment_to_merchant",
//       comment: `Payment for service ${serviceId} from ${clientClerkUserId} to ${consultantClerkUserId}`,
//       metadata: {
//         serviceId,
//         clientClerkUserId,
//         consultantClerkUserId,
//         consultantPhoneNumber: "1234567890",
//         clientPhoneNumber: "0987654321",
//       },
//     };

//     const res = {
//       id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//       sourceAccountId,
//       sequence_number: "6244377266243449",
//       channel: "internal",
//       status: "initiated",
//       amount,
//       currency: "SAR",
//       purpose: body.purpose,
//       comment: body.comment,
//       destination: {},
//       message: "Payment initiated",
//       failure_reason: "",
//       created_at: "Date and time when the payout was created.",
//       updated_at: "Date and time when the payout was last updated.",
//       metadata: {
//         ...body.metadata,
//       },
//     };
//     return res;
//   },
// });
