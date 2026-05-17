import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { Navbar } from "@/components/Navbar";
import { Container } from "@/components/Container";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jinxed — AI Generative Media",
  description: "Create and generate premium media using our advanced AI-powered creative engine.",
  keywords: ["AI", "Generative Media", "Next.js", "TypeScript", "Tailwind CSS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col antialiased selection:bg-violet-500/20 selection:text-violet-400">
        {/* Sticky Navbar */}
        <Navbar />

        {/* Centered Content Area */}
        <main className="flex-1 flex flex-col w-full">
          {children}
        </main>

        {/* Footer Placeholder */}
        <footer className="w-full border-t border-zinc-900/60 bg-zinc-950 py-8">
          <Container className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-400">Jinxed</span>
              <span>© {new Date().getFullYear()} Inc. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#privacy" className="hover:text-zinc-300 transition-colors duration-150">
                Privacy
              </a>
              <a href="#terms" className="hover:text-zinc-300 transition-colors duration-150">
                Terms
              </a>
              <a href="#support" className="hover:text-zinc-300 transition-colors duration-150">
                Support
              </a>
            </div>
          </Container>
        </footer>
      </body>
    </html>
  );
}
