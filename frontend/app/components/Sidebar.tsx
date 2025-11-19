'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaMusic, FaVideo, FaImage, FaBars, FaExchangeAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { UserProfile } from "./UserProfile";

const links = [
  { href: "/dashboard/audio", label: "Audio Tools", icon: FaMusic },
  { href: "/dashboard/video", label: "Video Tools", icon: FaVideo },
  { href: "/dashboard/image", label: "Image Tools", icon: FaImage },
  { href: "/dashboard/converter", label: "Converter", icon: FaExchangeAlt },
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
      window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: collapsed }));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: newState }));
    
    // Dispatch storage event for cross-tab updates (optional, but good practice)
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'sidebarCollapsed',
      newValue: JSON.stringify(newState)
    }));
  };

  return (
    <aside 
      className={`fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className={`flex h-14 items-center border-b px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
              <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                DailyTools
              </span>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={toggleSidebar} title={isCollapsed ? "Expand" : "Collapse"}>
            <FaBars />
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    isActive ? "bg-muted text-primary" : "text-muted-foreground"
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? link.label : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {!isCollapsed && <span>{link.label}</span>}
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
