"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/product", label: "Product" },
  { href: "/customers", label: "Customers" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/developers", label: "Developers" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F7FAF9] border-b border-[#E5E7EB]">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="rounded-md" />
          <span className="text-sm font-semibold text-[#0B2E2C]">YoDataSet</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-[#4A6461] hover:text-[#0B2E2C] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-[#0B2E2C] border border-[#E5E7EB] rounded-md px-3.5 py-1.5 hover:bg-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-white bg-[#028090] rounded-md px-3.5 py-1.5 hover:bg-[#026c78] transition-colors"
          >
            Sign up free
          </Link>
        </div>

        <button
          className="md:hidden p-1.5 text-[#0B2E2C]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-[#F7FAF9] px-6 py-4 space-y-3">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block text-sm text-[#4A6461] hover:text-[#0B2E2C]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/login"
            className="block text-sm font-medium text-[#0B2E2C] border border-[#E5E7EB] rounded-md px-3.5 py-2 text-center hover:bg-white transition-colors"
            onClick={() => setOpen(false)}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="block text-sm font-medium text-white bg-[#028090] rounded-md px-3.5 py-2 text-center hover:bg-[#026c78] transition-colors"
            onClick={() => setOpen(false)}
          >
            Sign up free
          </Link>
        </div>
      )}
    </header>
  );
}
