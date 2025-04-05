import {  Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { Toaster } from "sonner";

const inter=Inter({subsets:['latin']})

export const metadata = {
  title: "welth",
  description: "Finance platform / Personal finance / Budgeting",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
        <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
        <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made with 💗 by Harsh</p>
            </div>
          </footer>
      </body>
    </html>
  );
}
