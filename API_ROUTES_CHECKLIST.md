# Solrent Backend API Implementation Checklist

This document outlines all the necessary API routes you need to implement for your backend, organized by domain. You can use this as a checklist as you build out the backend to ensure every screen has the necessary data and actions.

## 1. Authentication (`/api/auth`)
*Used for user sign up, login, and session management.*

- [ ] `POST /api/auth/register` - Create a new user account (Landlord or Tenant)
- [ ] `POST /api/auth/login` - Authenticate user and establish session/token
- [ ] `POST /api/auth/logout` - Destroy session/token
- [ ] `GET /api/auth/me` - Get current authenticated user details
- [ ] `POST /api/auth/forgot-password` - Request a password reset link
- [ ] `POST /api/auth/reset-password` - Confirm new password with token

## 2. Landlord (`/api/landlord`)
*Routes for landlords to manage their properties and view overviews.*

- [ ] `GET /api/landlord/dashboard` - Get high-level stats (occupancy rate, total revenue, pending issues)
- [ ] `GET /api/landlord/buildings` - List all buildings owned by the landlord
- [ ] `POST /api/landlord/buildings` - Create a new building
- [ ] `GET /api/landlord/buildings/[id]` - Get details for a specific building
- [ ] `PUT /api/landlord/buildings/[id]` - Update building details
- [ ] `DELETE /api/landlord/buildings/[id]` - Remove a building
- [ ] `GET /api/landlord/units` - List all units (optionally filtered by `?buildingId=123`)
- [ ] `POST /api/landlord/units` - Add a new unit to a building
- [ ] `GET /api/landlord/units/[id]` - Get specific unit details
- [ ] `PUT /api/landlord/units/[id]` - Update unit details
- [ ] `GET /api/landlord/tenants` - List all tenants currently renting from this landlord
- [ ] `GET /api/landlord/settings` - Get landlord profile and notification preferences
- [ ] `PUT /api/landlord/settings` - Update landlord profile/preferences

## 3. Tenant (`/api/tenant`)
*Routes for tenants to view their active lease, dashboard, and settings.*

- [ ] `GET /api/tenant/dashboard` - Get tenant overview (next payment due, active lease summary)
- [ ] `GET /api/tenant/settings` - Get tenant profile details
- [ ] `PUT /api/tenant/settings` - Update tenant profile details

## 4. Leases (`/api/leases`)
*Routes handling the creation and lifecycle of rental agreements.*

- [ ] `GET /api/leases` - List leases (filtered by current user's role - landlord sees their properties' leases, tenant sees their own)
- [ ] `POST /api/leases` - Create a new lease agreement (draft)
- [ ] `GET /api/leases/[id]` - Get full lease details
- [ ] `PUT /api/leases/[id]` - Update lease terms (if in draft)
- [ ] `POST /api/leases/[id]/sign` - Tenant signs the lease
- [ ] `POST /api/leases/[id]/terminate` - End a lease early or at the end of the term

## 5. Payments (`/api/payments`)
*Routes for processing rent, tracking transactions, and payment methods.*

- [ ] `GET /api/payments/history` - List past payments (filtered by user)
- [ ] `GET /api/payments/upcoming` - List upcoming expected payments
- [ ] `POST /api/payments/process` - Submit a fiat/credit card payment (e.g., Stripe)
- [ ] `GET /api/payments/methods` - List saved payment methods for a user
- [ ] `POST /api/payments/methods` - Add a new payment method
- [ ] `DELETE /api/payments/methods/[id]` - Remove a payment method
- [ ] `POST /api/payments/webhook` - Webhook receiver for third-party payment gateways (Stripe, etc.)

## 6. Wallet / Web3 (`/api/wallet`)
*Routes for handling crypto transactions and wallet connections.*

- [ ] `POST /api/wallet/connect` - Link a Solana wallet to a user account
- [ ] `GET /api/wallet/balance` - Get linked wallet balance (optional, can be done client-side)
- [ ] `POST /api/wallet/pay-rent` - Verify and record a Solana rent transaction on the backend
- [ ] `GET /api/wallet/transactions` - Get on-chain transaction history related to this user

## 7. Notifications (`/api/notifications`)
*Routes for in-app alerts and notifications.*

- [ ] `GET /api/notifications` - List recent notifications for the user
- [ ] `PUT /api/notifications/[id]/read` - Mark a specific notification as read
- [ ] `PUT /api/notifications/read-all` - Mark all unread notifications as read
- [ ] `POST /api/notifications` - (Internal) Send a notification to a user

## 8. Modals / Shared Data (`/api/modals`)
*Endpoints that serve quick data specifically for UI modals.*

- [ ] `POST /api/modals/invite-tenant` - Send an email/SMS invitation to a prospective tenant

---

**Next Steps:**
1. Start creating files like `app/api/landlord/buildings/route.ts` and define the `export async function GET(request: Request)` methods.
2. Implement your database queries (Prisma/Supabase) within these handlers.
3. Check off the items on this list as you verify they work!
