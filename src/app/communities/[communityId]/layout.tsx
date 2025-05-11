
import type { ReactNode } from 'react';
import { getCommunityById } from '@/lib/communityData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { notFound } from 'next/navigation';
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
    // Or use Next.js notFound() for a proper 404 page
    // notFound(); 
    // For now, just show a message if notFound() isn't fully set up for App Router root.
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
      <Card className="overflow-hidden shadow-lg">
        <div className="relative h-48 md:h-64 w-full bg-muted">
          <Image
            src={`https://picsum.photos/seed/${community.imageSeed}-banner/1200/400`}
            alt={`${community.name} banner`}
            layout="fill"
            objectFit="cover"
            data-ai-hint="community event photo"
            priority
          />
          <div className="absolute inset-0 bg-black/30 flex items-end p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white shadow-md">{community.name}</h1>
          </div>
        </div>
        <CardContent className="p-4 md:p-6">
          <p className="text-muted-foreground">{community.description}</p>
          <p className="text-sm text-primary mt-1">{community.members} members</p>
        </CardContent>
      </Card>

      {community.subPages && community.subPages.length > 0 && (
        <CommunitySubPageNav communityId={community.id} subPages={community.subPages} className="mb-6" />
      )}
      
      <div>{children}</div>
    </div>
  );
}
