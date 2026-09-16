import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "AI-ERP · דשבורד ניהול",
  description: "דשבורד הניהול של מערכת AI-ERP",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-slate-900">
        <Nav />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
