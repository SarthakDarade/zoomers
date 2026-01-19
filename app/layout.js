import { Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartSidebar from "@/components/CartSidebar";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL('https://zoomers.shop'),
  title: {
    default: "ZOOMERS | ARCHIVE SYSTEM",
    template: "%s | ZOOMERS ARCHIVE"
  },
  description: "Advanced digital fashion artifacts. Engineered in London for the modern operator. Global dispatch.",
  keywords: ["fashion", "archive", "streetwear", "techwear", "london", "luxury"],
  authors: [{ name: "Zoomers Archive System" }],
  creator: "Zoomers Archive System",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zoomers.shop",
    siteName: "ZOOMERS ARCHIVE",
    title: "ZOOMERS | ARCHIVE SYSTEM",
    description: "Advanced digital fashion artifacts. Engineered in London for the modern operator.",
    images: [
      {
        url: "/og-image.jpg", // Needs actual asset
        width: 1200,
        height: 630,
        alt: "Zoomers Archive System"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ZOOMERS | ARCHIVE SYSTEM",
    description: "Advanced digital fashion artifacts. Engineered in London.",
    creator: "@zoomersoff"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { CurrencyProvider } from "@/context/CurrencyContext";
import { SettingsProvider } from "@/context/SettingsContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <AuthProvider>
          <SettingsProvider>
            <CurrencyProvider>
              <CartProvider>
                <Navbar />
                <CartSidebar />
                {children}
              </CartProvider>
            </CurrencyProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
