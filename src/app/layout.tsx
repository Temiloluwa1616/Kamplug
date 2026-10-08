import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "KamPlug",
  description: "Campus marketplace for Nigerian universities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-gray-50">
        <Header />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}