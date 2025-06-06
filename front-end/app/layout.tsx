import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "@mysten/dapp-kit/dist/index.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "USDH - Decentralized Compute-Backed Stablecoin System",
  description: "Connecting distributed compute resources with stablecoin technology to create a multi-asset backed financial ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
