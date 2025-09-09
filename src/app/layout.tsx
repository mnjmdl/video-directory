import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";

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
      <body className="font-sans bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors min-h-screen">
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
