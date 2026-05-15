import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Inventory",
  description: "A simple pantry inventory system for home."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
