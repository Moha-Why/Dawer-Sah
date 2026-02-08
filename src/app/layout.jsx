import "./globals.css";
import { Outfit } from "next/font/google";
import Footer from "./Footer";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import { Analytics } from "@vercel/analytics/react"

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400","500","600","700","800","900"]
});

export const metadata = {
  title: "Dawer Sah - Used Cars for Sale",
  description: "Find quality pre-owned vehicles at Dawer Sah. Wide selection of sedans, SUVs, trucks and more. Fair prices and trusted service.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.className} h-full`}>
      <body className={`${outfit.className} antialiased flex flex-col min-h-screen`}>
        <link rel="icon" href="/favicon.ico" />
        <Analytics />
        <ClientLayoutWrapper className="flex-grow">
          {children}
        </ClientLayoutWrapper>
        <Footer />
      </body>
    </html>
  );
}
