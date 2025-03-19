import type React from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { PageTransition } from "@/components/page-transition";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Career Coaching Portal",
  description: "A platform for career coaches to manage their students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <Suspense fallback={null}>
            <PageTransition />
          </Suspense>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
