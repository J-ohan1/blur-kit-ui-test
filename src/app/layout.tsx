import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blur Kit — Console",
  description: "grandMA3-style lighting console for Roblox",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
