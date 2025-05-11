
"use client";
import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react'; // Import React
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, User, Users, LogOut, Settings, Terminal, UserCircle, ChevronRight, Settings2, UserCog, Shapes, Package } from 'lucide-react';
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
import { getCommunityById, getSubPageById } from '@/lib/communityData'; // Import community data functions

interface AppLayoutProps {
  children: ReactNode;
}

interface BreadcrumbItem {
  name: string;
  href: string;
  icon?: JSX.Element;
}

const staticPageDetails: { [key: string]: { name: string; icon: JSX.Element; href: string} } = {
  '/dashboard': { name: 'Dashboard', icon: <Home className="h-5 w-5" />, href: '/dashboard' },
  '/profile': { name: 'Profile', icon: <UserCircle className="h-5 w-5" />, href: '/profile' },
  '/connections': { name: 'Connections', icon: <Users className="h-5 w-5" />, href: '/connections' },
  '/communities': { name: 'Communities', icon: <Shapes className="h-5 w-5" />, href: '/communities' },
  '/settings': { name: 'Settings', icon: <UserCog className="h-5 w-5" />, href: '/settings' },
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

  const mobileNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { href: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
    { href: '/connections', label: 'Network', icon: <Users className="h-5 w-5" /> },
    { href: '/communities', label: 'Groups', icon: <Shapes className="h-5 w-5" /> },
  ];
  
  const dropdownNavItems = Object.values(staticPageDetails).map(({ name, icon, href }) => ({
    href,
    label: name,
    icon: React.cloneElement(icon, { className: "mr-2 h-4 w-4" }),
  }));
  
  const generateBreadcrumbs = (path: string): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (segments.length === 0) return [];

    // First segment (top-level page)
    const firstSegmentPath = `/${segments[0]}`;
    if (staticPageDetails[firstSegmentPath]) {
      breadcrumbs.push({ ...staticPageDetails[firstSegmentPath] });
    } else {
      // Fallback for unknown top-level paths (though ideally all known top-levels are in staticPageDetails)
      breadcrumbs.push({ name: segments[0].charAt(0).toUpperCase() + segments[0].slice(1), href: firstSegmentPath, icon: <Package className="h-5 w-5" /> });
    }
    
    // Handle /communities/[communityId]
    if (segments[0] === 'communities' && segments[1]) {
      const community = getCommunityById(segments[1]);
      if (community) {
        breadcrumbs.push({ name: community.name, href: `/communities/${community.id}` });
      } else if (segments.length > 1 && breadcrumbs.length === 1) { // if community is the current page, don't add ID as a sub-breadcrumb
         breadcrumbs.push({ name: segments[1], href: `/communities/${segments[1]}` }); // Fallback to ID
      }

      // Handle /communities/[communityId]/[subPageId]
      if (segments[2]) {
        const subPage = community ? getSubPageById(community.id, segments[2]) : null;
        if (subPage) {
          breadcrumbs.push({ name: subPage.name, href: `/communities/${community!.id}/${subPage.id}` });
        } else if (breadcrumbs.length === 2) { // if subpage is the current page
           breadcrumbs.push({ name: segments[2], href: `/communities/${segments[1]}/${segments[2]}` }); // Fallback to ID
        }
      }
    }
    return breadcrumbs;
  };
  
  const breadcrumbItems = generateBreadcrumbs(pathname);
  const currentPrimaryPage = breadcrumbItems[0] || { name: "ConnectMe", href: "/dashboard", icon: <Terminal className="h-5 w-5" />};


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
        <div className="flex items-center gap-1 text-lg font-semibold overflow-hidden">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary flex-shrink-0">
            <Terminal className="h-6 w-6" />
            <span className="hidden sm:inline">ConnectMe</span>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 flex-shrink-0">
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
          
          <div className="flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.href}>
                {index > 0 && <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                <Link href={item.href} className="flex items-center gap-1 hover:underline flex-shrink-0" title={item.name}>
                  {index === 0 && item.icon && React.cloneElement(item.icon, { className: "h-5 w-5 text-foreground"})}
                  <span className={`text-foreground ${index > 0 ? 'truncate max-w-[100px] sm:max-w-[150px]' : ''}`}>{item.name}</span>
                </Link>
              </React.Fragment>
            ))}
            {breadcrumbItems.length === 0 && ( // Fallback if no breadcrumbs generated
              <>
                {React.cloneElement(currentPrimaryPage.icon!, { className: "h-5 w-5 text-foreground"})}
                <span className="text-foreground">{currentPrimaryPage.name}</span>
              </>
            )}
          </div>
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
        <div className="grid grid-cols-4 gap-1">
          {mobileNavItems.map((item) => (
            <Link
              key={`mobile-${item.label}`}
              href={item.href}
              className={`flex flex-col items-center rounded-md p-2 transition-colors hover:bg-accent/10 ${
                pathname.startsWith(item.href) ? 'text-primary' : 'text-muted-foreground hover:text-primary' // Use startsWith for active state
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
