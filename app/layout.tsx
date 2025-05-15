import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "貪食蛇遊戲",
  description: "一個用 Next.js 和 React 製作的貪食蛇遊戲",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${geistSans.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
