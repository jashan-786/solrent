# SolRent 🏠⛓️

SolRent is a decentralized property management platform built on the Solana blockchain. It automates rent collection, simplifies lease management, and provides NFT-based rental receipts, offering a transparent, efficient, and cryptographically secure solution for both landlords and tenants.

![SolRent Landing Page](https://via.placeholder.com/1200x600?text=SolRent+Dashboard+Preview)

## 🚀 Key Features

### For Landlords
- **Automated Revenue**: Smart contracts automatically process rent payments in USDC.
- **Real-time Analytics**: track occupancy rates, revenue trends, and payment health across multiple buildings.
- **Simplified Leasing**: Create and manage on-chain leases with integrated document storage.
- **Tenant Management**: Invite tenants, track history, and manage unit assignments effortlessly.

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
# --- Database (Supabase) ---
DATABASE_URL="postgresql://postgres..."
DIRECT_URL="postgresql://postgres..."

# --- Authentication ---
JWT_SECRET="your-secret-here"

# --- Storage (Supabase) ---
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-key"
SUPABASE_LEASE_DOCS_BUCKET="lease-documents"

# --- Solana Network ---
NEXT_PUBLIC_SOLANA_CLUSTER="devnet"
NEXT_PUBLIC_SOLANA_RPC_URL="https://devnet.helius-rpc.com/?api-key=..."

# --- Token Mints ---
NEXT_PUBLIC_USDC_DEVNET_MINT="3mY38dGsJrf5cq1UA3ZK6QpkDcprxaRiDq1GRWu74wXT"
SOLANA_TEST_USDC_MINT="3mY38dGsJrf5cq1UA3ZK6QpkDcprxaRiDq1GRWu74wXT"

# --- Automated Collection Bot (Cron) ---
SOLANA_FAUCET_SECRET_KEY="[your-bot-private-key-array]"
CRON_SECRET="your-random-cron-password"
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
