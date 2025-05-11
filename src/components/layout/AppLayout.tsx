
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
import { getCommunityById, getSubPageById, mockCommunities } from '@/lib/communityData'; 

interface AppLayoutProps {
  children: ReactNode;
}

interface LinkBreadcrumbItem {
  type?: 'link';
  name: string;
  href: string;
  icon?: JSX.Element;
}

interface TabSelectorBreadcrumbItem {
  type: 'tabSelector';
  activeTabName: string;
  activeTabIcon: JSX.Element;
}

type BreadcrumbItem = LinkBreadcrumbItem | TabSelectorBreadcrumbItem;


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
  const { settings } = useAuthSettings(); 
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
  
  const pathSegments = useMemo(() => pathname.split('/').filter(Boolean), [pathname]);

  const breadcrumbItems = useMemo(() => {
    const breadcrumbs: BreadcrumbItem[] = [];

    if (pathSegments.length === 0 && pathname === '/') { // Root path
        if (staticPageDetails['/dashboard']) {
            breadcrumbs.push({ ...staticPageDetails['/dashboard'], type: 'link' });
        }
        return breadcrumbs;
    }
    
    if (pathSegments.length > 0) {
        const firstSegmentKey = `/${pathSegments[0]}`;

        if (pathSegments[0] === 'communities') {
            // 1. Add "Communities" itself
            breadcrumbs.push({ ...staticPageDetails['/communities'], type: 'link' });

            if (pathSegments.length === 1) { // On /communities page
                const currentTab = searchParams.get('tab') || 'your-communities';
                const tabDetail = communityPageTabsDetails[currentTab] || communityPageTabsDetails['your-communities'];
                // This is a special item that renders as a dropdown trigger AND the active tab name
                breadcrumbs.push({
                    type: 'tabSelector',
                    activeTabName: tabDetail.name,
                    activeTabIcon: React.cloneElement(tabDetail.icon, { className: "h-5 w-5 text-foreground"}),
                });
            } else if (pathSegments.length >= 2) { // On /communities/[communityId] or deeper
                const communityId = pathSegments[1];
                const community = getCommunityById(communityId);

                // Determine parent tab ("Your Communities" or "Discover")
                const userCommunityIdsForDemo = mockCommunities.slice(0, 2).map(c => c.id); // Example: first 2 are user's
                const isUserCommunity = community ? userCommunityIdsForDemo.includes(community.id) : false;
                const parentTabKey = isUserCommunity ? 'your-communities' : 'discover';
                const parentTabDetail = communityPageTabsDetails[parentTabKey];
                
                // 2. Add "Your Communities" or "Discover & Features" as a link
                 if (parentTabDetail) {
                    breadcrumbs.push({ 
                        name: parentTabDetail.name, 
                        href: `/communities?tab=${parentTabDetail.hrefPart}`, 
                        // icon: React.cloneElement(parentTabDetail.icon, {className: "h-5 w-5"}), // Icon removed to avoid duplication from tabselector
                        type: 'link' 
                    });
                }
                
                // 3. Add Community Name
                if (community) {
                    breadcrumbs.push({ name: community.name, href: `/communities/${community.id}`, type: 'link' }); // No icon for community name
                    
                    // 4. Add SubPage Name (if exists)
                    if (pathSegments.length > 2) { 
                        const subPageId = pathSegments[2];
                        const subPage = getSubPageById(community.id, subPageId);
                        if (subPage) {
                            breadcrumbs.push({ name: subPage.name, href: `/communities/${community.id}/${subPage.id}`, type: 'link' }); // No icon for subpage
                        } else {
                             // Fallback for unknown subpage
                            breadcrumbs.push({ name: subPageId.charAt(0).toUpperCase() + subPageId.slice(1), href: `/communities/${community.id}/${subPageId}`, type: 'link' });
                        }
                    }
                } else {
                    // Fallback for unknown community
                    breadcrumbs.push({ name: communityId.charAt(0).toUpperCase() + communityId.slice(1), href: `/communities/${communityId}`, type: 'link' });
                }
            }
        } else if (staticPageDetails[firstSegmentKey]) { // For other static pages like /dashboard, /profile etc.
            breadcrumbs.push({ ...staticPageDetails[firstSegmentKey], type: 'link' });
            // Potentially add logic for sub-paths of other sections if they exist
        } else { // Fallback for unknown top-level paths
            breadcrumbs.push({ 
                name: pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1), 
                href: firstSegmentKey, 
                icon: <Package className="h-5 w-5" />, // Generic icon
                type: 'link' 
            });
        }
    }
    return breadcrumbs;
  }, [pathname, searchParams, pathSegments]);


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
  
  const isCommunityPage = pathname.startsWith('/communities');
  const isSpecificCommunityPath = isCommunityPage && pathSegments.length > 1; // e.g., /communities/[id] or /communities/[id]/[subpage]
  
  // Show main horizontal tabs if layoutMode is horizontal AND (not on communities page OR on main /communities page but not a specific one)
  const showHorizontalTabs = layoutMode === 'horizontal' && (!isCommunityPage || (isCommunityPage && !isSpecificCommunityPath));


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
            {breadcrumbItems.map((item, index) => {
              const key = item.type === 'tabSelector' ? `breadcrumb-tab-selector-${index}` : `${(item as LinkBreadcrumbItem).href}-${index}`;
              const isLastItem = index === breadcrumbItems.length - 1;

              // If item is the TabSelector for /communities page
              if (item.type === 'tabSelector') {
                return (
                  <React.Fragment key={key}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 flex-shrink-0">
                          <ChevronRight className="h-5 w-5" />
                          <span className="sr-only">Select community section</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Community Sections</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.values(communityPageTabsDetails).map(tabDetail => (
                          <DropdownMenuItem key={tabDetail.hrefPart} onClick={() => router.push(`/communities?tab=${tabDetail.hrefPart}`)} className="cursor-pointer">
                            {React.cloneElement(tabDetail.icon, { className: "mr-2 h-4 w-4" })}
                            <span>{tabDetail.name}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Render the active tab name and icon */}
                    {React.cloneElement(item.activeTabIcon, {className: "h-5 w-5 text-foreground flex-shrink-0"})}
                    <span className="text-foreground font-medium truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]" title={item.activeTabName}>
                      {item.activeTabName}
                    </span>
                  </React.Fragment>
                );
              }
              
              const linkItem = item as LinkBreadcrumbItem;
              // Determine if this link item is the "Communities" main link when on a specific community path
              const isCommunitiesMainLink = linkItem.href === '/communities' && index === 0 && pathSegments[0] === 'communities' && pathSegments.length > 1;
              const isSecondLevelCommunitiesLink = linkItem.href.startsWith('/communities?tab=') && index === 1 && pathSegments[0] === 'communities' && pathSegments.length > 1;


              return (
                <React.Fragment key={key}>
                  {/* Render ChevronRight conditionally or a Dropdown for community context */}
                  {index > 0 && (
                    isSecondLevelCommunitiesLink ? ( // If it's "Your Communities" or "Discover" under a specific community context
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 flex-shrink-0">
                            <ChevronRight className="h-5 w-5" />
                            <span className="sr-only">Select community tab view</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Switch Tab View</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {Object.values(communityPageTabsDetails).map(tabDetail => (
                            <DropdownMenuItem key={tabDetail.hrefPart} onClick={() => router.push(`/communities?tab=${tabDetail.hrefPart}`)} className="cursor-pointer">
                               {React.cloneElement(tabDetail.icon, { className: "mr-2 h-4 w-4" })}
                              <span>{tabDetail.name}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : ( // Regular static chevron for other subsequent items
                       !isCommunitiesMainLink && <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )
                  )}
                  
                  <Link href={linkItem.href} className="flex items-center gap-1 hover:underline flex-shrink-0" title={linkItem.name}>
                    {linkItem.icon && React.cloneElement(linkItem.icon, { className: "h-5 w-5 text-foreground flex-shrink-0" })}
                    <span className={`${isLastItem ? 'text-foreground font-medium' : 'text-muted-foreground text-sm'} truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]`}>
                      {linkItem.name}
                    </span>
                  </Link>
                </React.Fragment>
              );
            })}
            {/* Fallback if breadcrumbs are empty but not on root page */}
            {breadcrumbItems.length === 0 && pathname !== '/' && ( 
                 <div className="flex items-center gap-1">
                     <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground font-medium">{pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page'}</span>
                </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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
      
      {showHorizontalTabs && (
        <Tabs value={pathname === '/communities' ? (searchParams.get('tab') ? `/communities?tab=${searchParams.get('tab')}` : '/communities?tab=your-communities') : pathname} className="sticky top-16 z-20 w-full border-b bg-background/90 backdrop-blur-sm">
            <TabsList className={`grid w-full ${pathname === '/communities' ? 'grid-cols-2' : 'grid-cols-5'} h-auto`}>
            {pathname === '/communities' ? (
              Object.values(communityPageTabsDetails).map(tab => (
                <TabsTrigger key={tab.hrefPart} value={`/communities?tab=${tab.hrefPart}`} asChild className="flex-shrink-0 data-[state=active]:shadow-lg data-[state=active]:bg-card">
                   <Link href={`/communities?tab=${tab.hrefPart}`} className="flex flex-col items-center justify-center h-auto py-2.5 px-2 text-xs">
                     {React.cloneElement(tab.icon, {className: "h-5 w-5 mb-1"})}
                     <span>{tab.name}</span>
                   </Link>
                </TabsTrigger>
              ))
            ) : (
              Object.values(staticPageDetails).map(page => (
                <TabsTrigger key={page.href} value={page.href} asChild className="flex-shrink-0 data-[state=active]:shadow-lg data-[state=active]:bg-card">
                  <Link href={page.href} className="flex flex-col items-center justify-center h-auto py-2.5 px-2 text-xs">
                    {React.cloneElement(page.icon, {className: "h-5 w-5 mb-1"})}
                    <span>{page.name}</span>
                  </Link>
                </TabsTrigger>
              ))
            )}
          </TabsList>
        </Tabs>
      )}

      <main className={`flex-1 p-4 sm:p-6 md:p-8 ${layoutMode === 'stacked' || (layoutMode === 'horizontal' && (isGuest || isSpecificCommunityPath)) ? 'pb-20 md:pb-8' : 'pb-8'}`}>
        <div className="mx-auto max-w-6xl space-y-6">
         {children}
        </div>
      </main>
       <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} ConnectMe. All rights reserved.
      </footer>

      {(layoutMode === 'stacked' || (layoutMode === 'horizontal' && (isGuest || isSpecificCommunityPath ))) && (
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

