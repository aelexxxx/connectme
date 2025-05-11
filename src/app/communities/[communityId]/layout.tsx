
import type { ReactNode } from 'react';
import { getCommunityById } from '@/lib/communityData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
// notFound from next/navigation should be used when available in the environment
// import { notFound } from 'next/navigation'; 
import CommunitySubPageNav from '@/components/communities/CommunitySubPageNav';
import { AlertTriangle } from 'lucide-react';

export default function CommunityLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { communityId: string };
}) {
  const community = getCommunityById(params.communityId);

  if (!community) {
    // For now, just show a message if notFound() isn't fully set up or preferred.
     return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Community Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>The community you are looking for does not exist or could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden shadow-xl">
        <div className="relative h-48 md:h-64 w-full bg-muted">
          <Image
            src={`https://picsum.photos/seed/${community.imageSeed}-banner/1200/400`}
            alt={`${community.name} banner`}
            layout="fill"
            objectFit="cover"
            data-ai-hint="community event photo"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white shadow-md">{community.name}</h1>
             <p className="text-sm text-white/90 mt-1">{community.members} members</p>
          </div>
        </div>
        <CardContent className="p-4 md:p-6">
          <p className="text-muted-foreground">{community.description}</p>
        </CardContent>
      </Card>

      {community.subPages && community.subPages.length > 0 && (
         <div className="sticky top-[calc(theme(spacing.16)_-_1px)] sm:top-16 z-10 bg-background/80 backdrop-blur-sm -mx-2 px-2 md:-mx-0 md:px-0 py-2 rounded-b-md md:rounded-md shadow-sm">
            <CommunitySubPageNav communityId={community.id} subPages={community.subPages} />
        </div>
      )}
      
      <div>{children}</div>
    </div>
  );
}

