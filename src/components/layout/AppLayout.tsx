
"use client";
import type { ReactNode } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Home, User, Users, LogOut, Settings, Terminal, UserCircle, ChevronRight, Settings2, UserCog, Shapes, Package, Rows, Columns, Search, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useAuthSettings } from '@/contexts/AuthContext';
import { getCommunityById, getSubPageById } from '@/lib/communityData'; 

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

const communityPageTabsDetails: { [key: string]: { name: string; icon: JSX.Element; hrefPart: string } } = {
  'your-communities': { name: 'Your Communities', icon: <Library className="h-5 w-5" />, hrefPart: 'your-communities' },
  'discover': { name: 'Discover & Features', icon: <Search className="h-5 w-5" />, hrefPart: 'discover' },
};


export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, isGuest, loading } = useAuth();
  const { settings, updateUserSettings } = useAuthSettings();
  const layoutMode = settings.layoutMode || 'stacked';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
  
  const breadcrumbItems = useMemo(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (pathname === '/') { // Should redirect to /dashboard, but handle just in case
      if (staticPageDetails['/dashboard']) {
         breadcrumbs.push({ ...staticPageDetails['/dashboard'] });
      }
      return breadcrumbs;
    }
    
    // Handle top-level static pages
    const firstSegmentKey = `/${pathSegments[0]}`;
    if (staticPageDetails[firstSegmentKey]) {
      breadcrumbs.push({ ...staticPageDetails[firstSegmentKey] });
    } else if (pathSegments.length > 0) {
      // Fallback for unknown top-level segments (e.g. if a new page is added without static details)
      breadcrumbs.push({ 
        name: pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1), 
        href: firstSegmentKey, 
        icon: <Package className="h-5 w-5" /> 
      });
    }

    // Handle /communities page with tabs
    if (pathname === '/communities') {
      const currentTab = searchParams.get('tab') || 'your-communities'; // Default to 'your-communities'
      if (communityPageTabsDetails[currentTab]) {
        breadcrumbs.push({
          name: communityPageTabsDetails[currentTab].name,
          href: `/communities?tab=${communityPageTabsDetails[currentTab].hrefPart}`,
          icon: communityPageTabsDetails[currentTab].icon, // Use tab-specific icon
        });
      } else {
         // Fallback if tab param is invalid
         breadcrumbs.push({
          name: communityPageTabsDetails['your-communities'].name,
          href: `/communities?tab=${communityPageTabsDetails['your-communities'].hrefPart}`,
          icon: communityPageTabsDetails['your-communities'].icon,
        });
      }
    }
    // Handle specific community and sub-pages
    else if (pathSegments[0] === 'communities' && pathSegments.length > 1) {
      const communityId = pathSegments[1];
      const community = getCommunityById(communityId);
      
      if (community) {
        // The first breadcrumb is "Communities", add community name
        breadcrumbs.push({ name: community.name, href: `/communities/${community.id}` });
        
        if (pathSegments.length > 2) { 
          const subPageId = pathSegments[2];
          const subPage = getSubPageById(community.id, subPageId);
          if (subPage) {
            breadcrumbs.push({ name: subPage.name, href: `/communities/${community.id}/${subPage.id}` });
          } else {
            // Fallback for unknown sub-page
            breadcrumbs.push({ name: subPageId.charAt(0).toUpperCase() + subPageId.slice(1), href: `/communities/${community.id}/${subPageId}` });
          }
        }
      } else if (pathSegments.length > 1 && pathSegments[0] === 'communities'){
        // Fallback for unknown community
        breadcrumbs.push({ name: communityId.charAt(0).toUpperCase() + communityId.slice(1), href: `/communities/${communityId}` });
      }
    }
    return breadcrumbs;
  }, [pathname, searchParams]);


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

  // Determine if page-specific tabs should override main horizontal tabs
  const hasPageSpecificTabs = pathname.startsWith('/communities');

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
              <React.Fragment key={item.href + '-' + index}>
                {/* Chevron already present from dropdown trigger */}
                {/* {index > 0 && <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />} */}
                <Link href={item.href} className="flex items-center gap-1 hover:underline flex-shrink-0" title={item.name}>
                  {item.icon && React.cloneElement(item.icon, { className: "h-5 w-5 text-foreground"})}
                  <span className={`text-foreground ${index === breadcrumbItems.length -1 ? 'font-medium' : 'text-sm'} truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]`}>{item.name}</span>
                </Link>
                {index < breadcrumbItems.length - 1 && <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
              </React.Fragment>
            ))}
            {breadcrumbItems.length === 0 && pathname !== '/' && ( // Handle case where path is known but no breadcrumbs generated (e.g. root redirecting)
                 <div className="flex items-center gap-1">
                    {/* <Package className="h-5 w-5 text-foreground"/> */}
                    <span className="text-foreground font-medium">{pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page'}</span>
                </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Button
              variant="ghost"
              size="icon"
              onClick={() => updateUserSettings({ layoutMode: layoutMode === 'stacked' ? 'horizontal' : 'stacked' })}
              title={`Switch to ${layoutMode === 'stacked' ? 'Horizontal Tabs View' : 'Stacked View'}`}
              className="h-9 w-9"
            >
              {layoutMode === 'stacked' ? <Columns className="h-5 w-5" /> : <Rows className="h-5 w-5" />}
              <span className="sr-only">Toggle Layout Mode</span>
            </Button>
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
      
      {layoutMode === 'horizontal' && !hasPageSpecificTabs && (
        <Tabs value={pathname} className="sticky top-16 z-20 w-full border-b bg-background/90 backdrop-blur-sm">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            {Object.values(staticPageDetails).map(page => (
              <TabsTrigger key={page.href} value={page.href} asChild className="flex-shrink-0 data-[state=active]:shadow-lg data-[state=active]:bg-card">
                <Link href={page.href} className="flex flex-col items-center justify-center h-auto py-2.5 px-2 text-xs">
                  {React.cloneElement(page.icon, {className: "h-5 w-5 mb-1"})}
                  <span>{page.name}</span>
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <main className={`flex-1 p-4 sm:p-6 md:p-8 ${layoutMode === 'stacked' || (layoutMode === 'horizontal' && (isGuest || hasPageSpecificTabs)) ? 'pb-20 md:pb-8' : 'pb-8'}`}>
        <div className="mx-auto max-w-6xl space-y-6">
         {children}
        </div>
      </main>
       <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} ConnectMe. All rights reserved.
      </footer>

      {/* Show mobile nav only in stacked mode OR if guest in horizontal OR if page has specific tabs (to avoid double tab bars) */}
      {(layoutMode === 'stacked' || (layoutMode === 'horizontal' && (isGuest || hasPageSpecificTabs ))) && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card p-1 shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] md:hidden">
          <div className="grid grid-cols-4 gap-1">
            {mobileNavItems.map((item) => (
              <Link
                key={`mobile-${item.label}`}
                href={item.href}
                className={`flex flex-col items-center rounded-md p-2 transition-colors hover:bg-accent/10 ${
                  pathname.startsWith(item.href) ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {item.icon}
                <span className="mt-1 text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

