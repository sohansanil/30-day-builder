import type { Metadata } from "next";
import { VT323, Pixelify_Sans } from "next/font/google";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
});

export const metadata: Metadata = {
  title: "CipherLab OS v1.0",
  description: "Interactive Cryptography Museum",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Load 98.css for the classic Windows 98 UI components */}
        <link rel="stylesheet" href="https://unpkg.com/98.css" />
      </head>
      <body className={`${vt323.variable} ${pixelify.variable} antialiased`}>
        {/* The CRT scanlines overlay over the entire application */}
        <div className="crt-overlay pointer-events-none fixed inset-0 z-50"></div>
        {children}
      </body>
    </html>
  );
}
