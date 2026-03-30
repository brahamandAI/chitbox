import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChitBox - AI Mail Server",
  description: "Modern AI-powered email server with smart compose, CC/BCC, and intelligent email management",
  icons: {
    icon: [
      { url: '/chitbox-logo.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.png',      type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.png',
    apple: { url: '/chitbox-logo.png', sizes: '512x512', type: 'image/png' },
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
