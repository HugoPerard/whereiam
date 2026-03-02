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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://prdhugo.fr",
  ),
  title: {
    default: `Where is ${process.env.NAME ?? "prdHugo"}`,
    template: `${process.env.NAME ?? "prdHugo"} is in %s`,
  },
  description: `See where is ${process.env.NAME ?? "prdHugo"} and get a hello`,
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
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
