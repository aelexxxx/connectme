
import { getCommunityById } from '@/lib/communityData';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

// This page will act as a default landing for a community.
// It will try to redirect to the first available sub-page (e.g., 'overview').
// If no sub-pages, it might show a welcome message or community details.

export default function CommunityDefaultPage({ params }: { params: { communityId: string } }) {
  const community = getCommunityById(params.communityId);

  if (!community) {
    notFound();
  }

  // Redirect to the first sub-page, typically 'overview' if it exists
  const firstSubPage = community.subPages.find(sp => sp.id === 'overview') || community.subPages[0];

  if (firstSubPage) {
    redirect(`/communities/${community.id}/${firstSubPage.id}`);
  }

  // Fallback content if no sub-pages (should ideally not happen with good data)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-6 w-6 text-primary" />
          Welcome to {community.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>This community doesn't have specific sections configured yet. Check back later!</p>
        <p className="mt-2 text-sm text-muted-foreground">{community.description}</p>
      </CardContent>
    </Card>
  );
}
