'use client';

import { Sidebar } from "../components/Sidebar";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load sidebar state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }

    // Listen for storage changes
    const handleStorage = () => {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    };

    window.addEventListener('storage', handleStorage);
    
    // Also listen for custom event for same-tab updates
    const handleSidebarToggle = ((e: CustomEvent) => {
      setIsCollapsed(e.detail.isCollapsed);
    }) as EventListener;
    
    window.addEventListener('sidebarToggle', handleSidebarToggle);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [children]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        // Desktop: respect sidebar state
        "lg:pl-64",
        isCollapsed && "lg:pl-20",
        // Mobile: no padding (sidebar is overlay)
        "pl-0"
      )}>
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-20 bg-background border-b px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-lg bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            DailyTools
          </span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
