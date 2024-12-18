import type { Metadata } from "next";
import { AR_One_Sans } from "next/font/google";
import "./globals.css";

const arOneSans = AR_One_Sans({
  subsets: ["latin"],
  variable: "--font-ar-one-sans",
});

export const metadata: Metadata = {
  title: "Where I'm",
  description: "See where currently I'm, and some stuff about that",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${arOneSans.variable}  antialiased`}>{children}</body>
    </html>
  );
}
