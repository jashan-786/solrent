import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "../global.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "SolRent | Web3 Real Estate",
  description: "Web3 Real Estate platform for the Colosseum Solana Hackathon",
};

import { SolanaWalletProvider } from "@/components/providers/wallet-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable} antialiased `}>
        <SolanaWalletProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
