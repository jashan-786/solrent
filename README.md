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

2. Install dependencies:
   ```sh
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in `apps/web/` and add the necessary variables:
   ```env
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
   NEXT_PUBLIC_USDC_DEVNET_MINT="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
   SUPABASE_URL="https://..."
   SUPABASE_SERVICE_ROLE_KEY="..."
   JWT_SECRET="..."
   ```

4. Initialize the database:
   ```sh
   pnpm --filter web prisma db push
   ```

5. Run the development server:
   ```sh
   pnpm dev
   ```

## 🔐 Security & Blockchain

SolRent leverages Solana's high-speed, low-cost infrastructure to ensure that rent payments are settled instantly and transparently.
- **PDAs (Program Derived Addresses)**: Each lease and vault is secured via deterministic PDAs.
- **USDC Payments**: All transactions use native USDC for price stability.
- **Non-Custodial**: Users interact directly with smart contracts via their own wallets.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the Solana Ecosystem.
