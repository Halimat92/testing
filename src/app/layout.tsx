import type { Metadata } from "next";
import { newsreader, manrope } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leemah Cakes N More | Dessert Jars, Made Fresh in the UK",
  description:
    "Small-batch dessert jars and celebration cakes, handmade to order and delivered fresh across the UK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${newsreader.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
