
"use client";
import type { ReactNode } from 'react';
import * as React from 'react'; // Import React
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, User, Users, LogOut, Settings, Terminal, UserCircle, ChevronRight, Settings2, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

const pageDetails: { [key: string]: { name: string; icon: JSX.Element } } = {
  '/dashboard': { name: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  '/profile': { name: 'Profile', icon: <UserCircle className="h-5 w-5" /> },
  '/connections': { name: 'Connections', icon: <Users className="h-5 w-5" /> },
  '/settings': { name: 'Settings', icon: <UserCog className="h-5 w-5" /> },
};


export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, isGuest, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    logout();
  };

  // Mobile navigation items (bottom bar)
  const mobileNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { href: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> }, // User icon for mobile simplicity
    { href: '/connections', label: 'Connections', icon: <Users className="h-5 w-5" /> },
  ];
  
  const currentPage = pageDetails[pathname] || { name: 'Page', icon: <Terminal className="h-5 w-5" /> };

  // Navigation items for the new header dropdown
  const dropdownNavItems = Object.entries(pageDetails).map(([path, { name, icon }]) => ({
    href: path,
    label: name,
    // Clone icon to add specific styling for dropdown menu item
    icon: React.cloneElement(icon, { className: "mr-2 h-4 w-4" }), 
  }));


  if (loading || !mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Terminal className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading ConnectMe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-1 text-lg font-semibold"> {/* Adjusted gap */}
          <Link href="/dashboard" className="flex items-center gap-2 text-primary">
            <Terminal className="h-6 w-6" />
            <span>ConnectMe</span>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0">
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Go to</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dropdownNavItems.map((item) => (
                <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)} className="cursor-pointer">
                  {item.icon}
                  <span>{item.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {React.cloneElement(currentPage.icon, { className: "h-5 w-5 text-foreground"})}
          <span className="text-foreground">{currentPage.name}</span>
        </div>
        

        <div className="flex items-center gap-4">
          {user || isGuest ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage 
                      src={isGuest ? `https://picsum.photos/seed/guest/32/32` : user?.photoUrl || `https://picsum.photos/seed/${user?.name?.toLowerCase().replace(/\s+/g, '_') || 'user'}/32/32`} 
                      alt={user?.name || 'Guest'}
                      data-ai-hint="user avatar" />
                    <AvatarFallback>{isGuest ? 'G' : user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {isGuest ? 'Guest User' : user?.name || 'User'}
                    </p>
                    {!isGuest && user && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isGuest && (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </>
                )}
                {isGuest && (
                    <DropdownMenuItem onClick={() => router.push('/login')}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Login/Sign Up
                    </DropdownMenuItem>
                )}
                {!isGuest && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50 dark:text-red-500 dark:focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Button onClick={() => router.push('/login')} variant="outline">Login</Button>
          )}
        </div>
      </header>
      
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card p-1 shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] md:hidden">
        <div className="grid grid-cols-3 gap-1">
          {mobileNavItems.map((item) => (
            <Link
              key={`mobile-${item.label}`}
              href={item.href}
              className={`flex flex-col items-center rounded-md p-2 transition-colors hover:bg-accent/10 ${
                pathname === item.href ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {item.icon}
              <span className="mt-1 text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
        <div className="mx-auto max-w-6xl space-y-6">
         {children}
        </div>
      </main>
       <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} ConnectMe. All rights reserved.
      </footer>
    </div>
  );
}

