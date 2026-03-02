import type { Metadata } from "next";
import { Bricolage_Grotesque, Sono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const sono = Sono({
  subsets: ["latin"],
  variable: "--font-sono",
});

export const metadata: Metadata = {
  title: `Where is ${process.env.NAME ?? "prdHugo"}`,
  description: "See where currently I'm, and some stuff about that",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${bricolage.variable} ${sono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
