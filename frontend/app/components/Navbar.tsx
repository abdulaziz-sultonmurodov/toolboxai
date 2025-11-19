'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              DailyTools
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Features
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground">
              Tools
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60">
              Login
            </Link>
            <Button asChild variant="default" size="sm">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </div>
    </nav>
  );
};
