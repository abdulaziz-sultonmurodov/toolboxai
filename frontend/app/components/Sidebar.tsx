'use client';

import Link from "next/link";
import { FaMusic, FaVideo, FaImage, FaHome, FaSignOutAlt, FaExchangeAlt, FaBars } from "react-icons/fa";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('sidebarToggle', { 
      detail: { isCollapsed: newState } 
    }));
  };

  const links = [
    { name: 'Overview', href: '/dashboard', icon: FaHome },
    { name: 'Audio Tools', href: '/dashboard/audio', icon: FaMusic },
    { name: 'Video Tools', href: '/dashboard/video', icon: FaVideo },
    { name: 'Image Tools', href: '/dashboard/image', icon: FaImage },
    { name: 'Converter', href: '/dashboard/converter', icon: FaExchangeAlt },
  ];

  return (
    <aside 
      className={cn(
        "h-screen bg-card border-r border-border fixed left-0 top-0 flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn(
        "p-6 border-b border-border flex items-center",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            DailyTools
          </h2>
        )}
        <div className="flex items-center gap-2">
          {!isCollapsed && <ThemeToggle />}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="h-8 w-8"
          >
            <FaBars className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? link.name : undefined}
            >
              <Icon size={20} />
              {!isCollapsed && link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors",
            isCollapsed && "justify-center"
          )}
          onClick={() => localStorage.removeItem('token')}
          title={isCollapsed ? "Logout" : undefined}
        >
          <FaSignOutAlt size={20} />
          {!isCollapsed && "Logout"}
        </Link>
      </div>
    </aside>
  );
};
