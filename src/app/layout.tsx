import type { Metadata } from "next";
import { Dancing_Script, Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { AuthGate } from "@/components/auth-gate";
import { Navbar } from "@/components/navbar";
import { HeartsBackground } from "@/components/hearts-background";
import { CursorHearts } from "@/components/cursor-hearts";
import { ScrollProvider } from "@/components/scroll-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SecretModeProvider } from "@/contexts/secret-mode-context";
import { SecretModeRoot } from "@/components/secret-mode-root";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Em & Anh",
  description: "Em & Anh – Our story, moments, and love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${dancingScript.variable} antialiased`}
      >
        <AuthProvider>
          <AuthGate>
            <ThemeProvider>
              <SecretModeProvider>
                <ScrollProvider>
                <div className="page-gradient relative min-h-screen overflow-x-hidden overflow-y-auto">
                  <HeartsBackground />
                  <CursorHearts />
                  <div className="relative z-10">
                    <Navbar />
                    {children}
                  </div>
                  <SecretModeRoot />
                </div>
                </ScrollProvider>
              </SecretModeProvider>
            </ThemeProvider>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
