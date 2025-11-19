'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Music, Video, Image as ImageIcon, FileJson, Share2, Menu, Mic } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { UserProfile } from "./UserProfile";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type NavLink = {
  name: string;
  href: string;
  icon: any;
  badge?: string;
};


const links: NavLink[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Audio Tools', href: '/dashboard/audio', icon: Music },
  { name: 'Video Tools', href: '/dashboard/video', icon: Video },
  { name: 'Image Tools', href: '/dashboard/image', icon: ImageIcon },
  { name: 'Converter', href: '/dashboard/converter', icon: FileJson },
  { name: 'Socials', href: '/dashboard/socials', icon: Share2 },
  { name: 'Music ID', href: '/dashboard/music-id', icon: Mic, badge: 'NEW' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      const collapsed = JSON.parse(savedState);
      setIsCollapsed(collapsed);
      // Dispatch event on mount to sync layout
      window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isCollapsed: collapsed } }));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { isCollapsed: newState } }));
    
    // Dispatch storage event for cross-tab updates (optional, but good practice)
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'sidebarCollapsed',
      newValue: JSON.stringify(newState)
    }));
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300",
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className={cn(
          "flex h-14 items-center border-b px-4",
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
              <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                DailyTools
              </span>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={toggleSidebar} title={isCollapsed ? "Expand" : "Collapse"}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid gap-1 px-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive ? "bg-muted text-primary" : "text-muted-foreground",
                    isCollapsed ? 'justify-center' : ''
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && (
                    <>
                      <span>{link.name}</span>
                      {link.badge && (
                        <Badge variant="default" className="ml-auto bg-gradient-to-r from-pink-500 to-violet-500 text-white border-0">
                          {link.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer (User Profile) */}
        <div className="border-t p-4">
          <UserProfile isCollapsed={isCollapsed} />
        </div>
      </div>
    </aside>
  );
};
