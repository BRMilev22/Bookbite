import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Providers } from "./providers";

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
        <Providers>
          <div className="flex flex-col min-h-screen bg-tableease-dark">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
