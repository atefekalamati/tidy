import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
});

const title = "Tidy - Kanban board";
const description =
  "A bilingual Persian/English Kanban project board with a team chat, built in the Carabin vibe coding bootcamp.";

export const metadata: Metadata = {
  // Netlify sets URL at build time; link previews need absolute image addresses.
  metadataBase: new URL(process.env.URL ?? "http://localhost:3000"),
  title,
  description,
  openGraph: { title, description, type: "website", siteName: "Tidy" },
  twitter: { card: "summary_large_image", title, description },
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
