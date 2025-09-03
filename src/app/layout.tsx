import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crystal Video Library - Your Video Collection",
  description: "A comprehensive video library platform for organizing and sharing videos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors min-h-screen`}>
        <Providers>
          <Header />
          <main className="pt-16">
            {children}

          </main>
        </Providers>
      </body>
    </html>
  );
}
