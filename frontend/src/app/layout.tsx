import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "GlobeTrotter — Plan trips you'll actually take",
    template: "%s — GlobeTrotter",
  },
  description:
    "Discover destinations, save places you love and build day-by-day itineraries with budgets.",
  authors: [{ name: "GlobeTrotter" }],
  openGraph: {
    title: "GlobeTrotter",
    description: "Discover, save and plan your next trip.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
