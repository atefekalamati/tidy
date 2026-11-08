import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "Tidy - Kanban board",
  description: "A bilingual project board with task chat rooms",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${GeistSans.variable} ${GeistMono.variable} ${vazirmatn.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
