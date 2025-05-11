
"use client";

import type { SubPage } from "@/types/community";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { MessageSquare, CalendarDays, MessagesSquare, Pin, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils"; // Added import for cn

interface CommunitySubPageNavProps {
  communityId: string;
  subPages: SubPage[];
  className?: string;
}

const iconMap: { [key: string]: LucideIcon } = {
  MessageSquare,
  CalendarDays,
  MessagesSquare,
  Pin,
  LayoutDashboard,
};

const getIconByName = (name?: string): LucideIcon | null => {
  if (!name || !iconMap[name]) return LayoutDashboard; // Default icon if not found or name is undefined
  return iconMap[name];
};

export default function CommunitySubPageNav({ communityId, subPages, className }: CommunitySubPageNavProps) {
  const pathname = usePathname();
  const currentSubPageId = pathname.split("/").pop();

  if (!subPages || subPages.length === 0) {
    return null;
  }

  return (
    <Tabs value={currentSubPageId} className={cn("w-full", className)}>
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap gap-1 h-auto">
        {subPages.map((subPage) => {
          const IconComponent = getIconByName(subPage.iconName);
          return (
            <TabsTrigger key={subPage.id} value={subPage.id} asChild className="flex-grow data-[state=active]:shadow-md data-[state=active]:bg-card py-2.5">
              <Link href={`/communities/${communityId}/${subPage.id}`} className="flex items-center justify-center gap-2 text-sm">
                {IconComponent && <IconComponent className="h-4 w-4" />}
                {subPage.name}
              </Link>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

