'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { FaUser, FaSignOutAlt, FaMoon, FaSun, FaCog } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useLanguage } from "../i18n/LanguageContext";

interface UserProfileProps {
  isCollapsed: boolean;
}

export function UserProfile({ isCollapsed }: UserProfileProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();

  // Mock user data - in a real app, this would come from auth context
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    image: "" // Empty for fallback
  };

  const handleLogout = () => {
    // Implement logout logic here
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`w-full flex items-center gap-3 h-auto py-2 px-2 hover:bg-accent ${isCollapsed ? 'justify-center' : 'justify-start'}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="flex flex-col items-start text-left overflow-hidden">
              <span className="text-sm font-medium truncate w-full max-w-[140px]">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground truncate w-full max-w-[140px]">
                {user.email}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-56" 
        align={isCollapsed ? "start" : "end"} 
        side={isCollapsed ? "right" : "right"} 
        sideOffset={isCollapsed ? 10 : 5}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
          <FaUser className="mr-2 h-4 w-4" />
          <span>{t('profile.editProfile')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? (
            <>
              <FaSun className="mr-2 h-4 w-4" />
              <span>{t('profile.lightMode')}</span>
            </>
          ) : (
            <>
              <FaMoon className="mr-2 h-4 w-4" />
              <span>{t('profile.darkMode')}</span>
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/20" onClick={handleLogout}>
          <FaSignOutAlt className="mr-2 h-4 w-4" />
          <span>{t('profile.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
