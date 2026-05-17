"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Sparkles, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Showcase", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-navbar">
      <Container className="flex h-16 items-center justify-between">
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-opacity duration-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-violet-400 group-hover:border-violet-500 transition-all duration-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-zinc-100">
            Jinxed<span className="text-violet-500 font-bold">.</span>
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side: CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/signin"
            className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/get-started"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-violet-600 px-4 text-sm font-medium text-zinc-50 shadow-sm shadow-violet-900/20 transition-all duration-200 hover:bg-violet-500 active:scale-95 border border-violet-500/30 hover:border-violet-400/50"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 transition-all"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg px-6 py-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-zinc-400 hover:text-zinc-100 transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-zinc-800/80 my-2" />
            <div className="flex flex-col gap-4">
              <Link
                href="/signin"
                onClick={() => setIsOpen(false)}
                className="flex h-10 items-center justify-center rounded-lg border border-zinc-800 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/get-started"
                onClick={() => setIsOpen(false)}
                className="flex h-10 items-center justify-center rounded-lg bg-violet-600 text-sm font-medium text-zinc-50 transition-all hover:bg-violet-500"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
