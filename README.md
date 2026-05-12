# SolRent 🏠⛓️

SolRent is a decentralized property management platform built on the Solana blockchain. It automates rent collection, simplifies lease management, and provides NFT-based rental receipts, offering a transparent, efficient, and cryptographically secure solution for both landlords and tenants.

https://solrent-web.vercel.app/

## 🚀 Key Features

### For Landlords
- **Automated Revenue**: Smart contracts automatically process rent payments in USDC.
- **Real-time Analytics**: track occupancy rates, revenue trends, and payment health across multiple buildings.
- **Simplified Leasing**: Create and manage on-chain leases with integrated document storage.
- **Tenant Management**: Invite tenants, track history, and manage unit assignments easily.

### For Tenants
- **Auto-Pay**: Set it and forget it. Authorize smart contracts to handle rent payments automatically.
- **NFT Receipts**: Receive unique, collectible NFTs for every successful rent payment—building your on-chain rental reputation.
- **Transparent History**: View all past payments and lease terms directly on the blockchain.
- **Secure Access**: Sign in with your Solana wallet—no passwords, just cryptography.

## 🛠️ Tech Stack

- **Monorepo**: [Turborepo](https://turbo.build/)
- **Blockchain**: [Solana](https://solana.com/) (Anchor Framework)
- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Database**: [Prisma](https://www.prisma.io/) with PostgreSQL
- **Storage**: [Supabase](https://supabase.com/) (Lease documents & Storage)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/), [SWR](https://swr.vercel.app/)
- **Authentication**: JWT (jose) with Solana Wallet signature verification

## 📦 Project Structure

```text
.
├── apps
│   └── web                 # Next.js 16 Application
├── packages
│   ├── anchor              # Solana Smart Contract (IDL, types, helper functions)
│   ├── ui                  # Shared React Component Library (TailwindCSS)
│   ├── typescript-config   # Shared TS configurations
│   ├── eslint-config       # Shared ESLint configurations
│   └── tailwind-config     # Shared Tailwind configurations
```

## ⚙️ Getting Started

### Prerequisites
- Node.js 20+ 
- pnpm 9+
- Solana CLI & Anchor (for contract development)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/solrent.git
   cd solrent
   ```
### 1. Environment Configuration

Create a `.env` file in the root directory (and `apps/web/.env`) with the following variables:

```bash
# SolRent Master Environment Template (Example)
# Copy this to .env.local and fill in the values

# --- Database ---
DATABASE_URL="postgresql://user:pass@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/postgres"

# --- Authentication ---
JWT_SECRET="your-secure-jwt-secret"

# --- Solana Network & RPC ---
NEXT_PUBLIC_SOLANA_CLUSTER="devnet"
NEXT_PUBLIC_SOLANA_RPC_URL="https://your-helius-rpc-url"
SOLANA_DEVNET_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_HELIUS_DEVNET_RPC_URL="https://your-helius-rpc-url"

# --- Solana Assets (USDC) ---
NEXT_PUBLIC_USDC_DEVNET_MINT="3mY38dGsJrf5cq1UA3ZK6QpkDcprxaRiDq1GRWu74wXT"
SOLANA_TEST_USDC_MINT="3mY38dGsJrf5cq1UA3ZK6QpkDcprxaRiDq1GRWu74wXT"

# --- Solana Faucet ---
SOLANA_FAUCET_SECRET_KEY="your-faucet-secret-key-bs58-or-json"

# --- Supabase Storage ---
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-key"
SUPABASE_LEASE_DOCS_BUCKET="lease-documents"

# --- Automation & Cron ---
CRON_SECRET="your-cron-secret"
```

### 2. Installation & Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm postinstall

# Run database migrations
npx prisma db push

# Start the development server
pnpm dev
```

## 🧪 Testing the Application

To fully test SolRent, you'll need a Solana wallet (e.g., Phantom or Solflare) set to **Devnet**.

### 1. Get Test Assets
SolRent runs on **USDC** (Devnet). We've built in a developer faucet for easy testing:
- **USDC Faucet**: Navigate to the dashboard or settings and look for "Mint Devnet Funds" or use the developer endpoint directly: `GET /api/dev/faucet/usdc?publicKey=YOUR_WALLET_ADDRESS`.
- **SOL**: You'll need a small amount of SOL for transaction fees. Use the [Solana Faucet](https://faucet.solana.com/).

### 2. Landlord Workflow (Phase 1)
1.  **Register**: Go to `/register`, select **Landlord**, and connect your wallet.
2.  **Verify Setup**: Click **"Complete Setup"** on the dashboard to initialize your USDC account.
3.  **Add Property**: Click **"Add Property"** and fill in the building details.
4.  **Invite Tenant**: Open the building view, click **"Invite Tenant"**, select a unit (optional), and **Generate Invite Code**. Copy this code.

### 3. Tenant Workflow (Phase 2)
1.  **Register**: Open a new private window, go to `/register`, select **Tenant**.
2.  **Link Lease**: Enter the **Invite Code** you copied from the landlord.
3.  **Dashboard**: Once registered, you'll see your active lease and a **"Pay Rent"** button.

### 4. Auto-Pay & Automated Collection
- **Delegate**: As a tenant, go to **Settings** and toggle **"Auto-Pay"**. This authorizes the SolRent contract to collect rent on your behalf.
- **Trigger Collection**: You can manually trigger the collection bot (as a developer) by calling:
  `POST /api/cron/collect` with the `CRON_SECRET` header.

---


### 3. Vercel Deployment (Monorepo)

When deploying to Vercel, ensure the following:
1.  **Framework Preset**: Next.js
2.  **Root Directory**: `apps/web`
3.  **Environment Variables**: Add all variables from the list above to the Vercel Dashboard.
4.  **Turbo Config**: All environment variables must be listed in the `globalEnv` or task `env` in `turbo.json`.

---

## 🤖 Automated Rent Collection
SolRent features a built-in collection bot located at `/api/cron/collect`. 
- **Trigger**: Can be scheduled via `vercel.json` or a manual CRON task.
- **Security**: Requires a `Bearer {CRON_SECRET}` authorization header.
- **Function**: Automatically executes due payments using the server-side bot wallet.

## 🔐 Security & Blockchain

SolRent leverages Solana's high-speed, low-cost infrastructure to ensure that rent payments are settled instantly and transparently.
- **PDAs (Program Derived Addresses)**: Each lease and vault is secured via deterministic PDAs.
- **USDC Payments**: All transactions use native USDC for price stability.
- **Non-Custodial**: Users interact directly with smart contracts via their own wallets.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the Solana Ecosystem.
