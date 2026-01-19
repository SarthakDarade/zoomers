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
  title: "ZOOMERS | STORE",
  description: "Advanced digital fashion artifacts.",
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
