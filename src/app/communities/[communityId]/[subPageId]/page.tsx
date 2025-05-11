
import { getCommunityById, getSubPageById } from '@/lib/communityData';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, CalendarDays, MessagesSquare, Pin, LayoutDashboard, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Helper function to get an icon for the sub-page type
const getSubPageTypeIcon = (type: string): LucideIcon => {
  switch (type) {
    case 'chat': return MessageSquare;
    case 'calendar': return CalendarDays;
    case 'forum': return MessagesSquare;
    case 'pinboard': return Pin;
    case 'overview': return LayoutDashboard;
    default: return LayoutDashboard; // Default icon
  }
};


export default function CommunitySubPage({ params }: { params: { communityId: string; subPageId: string } }) {
  const community = getCommunityById(params.communityId);
  const subPage = community ? getSubPageById(params.communityId, params.subPageId) : undefined;

  if (!community || !subPage) {
    // notFound(); 
    // Temporary fallback for environments where notFound might not be fully configured in root
    return (
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Content Not Found
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p>The specific community section you are looking for does not exist or could not be loaded.</p>
        </CardContent>
      </Card>
    );
  }

  const PageIcon = getSubPageTypeIcon(subPage.type);

  const renderSubPageContent = () => {
    switch (subPage.type) {
      case 'chat':
        return <p className="text-muted-foreground">Real-time chat messages for {subPage.name} would appear here. Engage in live discussions with other community members!</p>;
      case 'calendar':
        return <p className="text-muted-foreground">An interactive calendar for {subPage.name}, showing upcoming events, meetings, or deadlines would be displayed here. Members could add and view entries.</p>;
      case 'forum':
        return <p className="text-muted-foreground">A list of discussion topics and threads for {subPage.name} would be presented here. Start new discussions or reply to existing ones.</p>;
      case 'pinboard':
        return <p className="text-muted-foreground">Important announcements, pinned messages, or shared resources for {subPage.name} would be shown here, often with options for comments or reactions.</p>;
      case 'overview':
         return (
            <>
                <p className="text-muted-foreground mb-4">This is the main overview for {community.name}. Here you might find a summary of recent activity, featured content, or quick links to other sections.</p>
                <p className="text-sm">Community Description: {community.description}</p>
                <p className="text-sm mt-1">Members: {community.members}</p>
            </>
        );
      default:
        return <p className="text-muted-foreground">Content for the '{subPage.name}' section will be available soon.</p>;
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <PageIcon className="h-6 w-6 text-primary" />
          {subPage.name}
        </CardTitle>
        {/* Removed CardDescription to simplify header as per request */}
        {/* 
        <CardDescription>
          Welcome to the {subPage.name} section of the {community.name} community.
        </CardDescription>
        */}
      </CardHeader>
      <CardContent className="prose dark:prose-invert max-w-none">
        {renderSubPageContent()}
      </CardContent>
    </Card>
  );
}

