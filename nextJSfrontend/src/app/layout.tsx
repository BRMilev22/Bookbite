import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "BookBite - Restaurant Reservation System",
  description: "A modern restaurant reservation system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          {children}
        </main>
      </body>
    </html>
  );
}
