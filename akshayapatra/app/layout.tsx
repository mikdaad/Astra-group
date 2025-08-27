import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "./components/layout/ConditionalLayout";
import { Toaster } from "@/components/ui/sonner";
import StorageInitializer from "./components/storage/StorageInitializer";
import ProfileSetupWrapper from "./components/ProfileSetupWrapper";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});



const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Akshayapatra",
  description: "Financial services platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* Global background layer so areas behind sidebar/header are not white */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: 'linear-gradient(to top, #090300, #351603, #6E2B00, #CA5002)'
          }}
        />
        <StorageInitializer />
        <ProfileSetupWrapper>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ProfileSetupWrapper>
        {/* App chrome (header/sidebar/nav), hidden on certain routes via client component */}
        <Toaster />
      </body>
    </html>
  );
}