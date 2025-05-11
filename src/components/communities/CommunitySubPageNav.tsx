
"use client";

import type { SubPage } from "@/types/community";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface CommunitySubPageNavProps {
  communityId: string;
  subPages: SubPage[];
  className?: string;
}

export default function CommunitySubPageNav({ communityId, subPages, className }: CommunitySubPageNavProps) {
  const pathname = usePathname();
  const currentSubPageId = pathname.split("/").pop();

  if (!subPages || subPages.length === 0) {
    return null;
  }

  return (
    <Tabs value={currentSubPageId} className={className}>
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap">
        {subPages.map((subPage) => {
          const IconComponent = subPage.icon as LucideIcon | undefined;
          return (
            <TabsTrigger key={subPage.id} value={subPage.id} asChild className="flex-grow data-[state=active]:shadow-md">
              <Link href={`/communities/${communityId}/${subPage.id}`} className="flex items-center gap-2">
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
