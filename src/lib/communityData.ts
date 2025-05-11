
import type { Community, SubPage } from '@/types/community';
import { MessageSquare, CalendarDays, MessagesSquare, Pin, LayoutDashboard } from 'lucide-react';

export const mockCommunities: Community[] = [
  {
    id: "local-run-club",
    name: "Local Run Club",
    members: 42,
    imageSeed: "runclub",
    description: "Weekly runs, marathon training, and social events for running enthusiasts in the area.",
    subPages: [
      { id: "overview", name: "Overview", type: "overview", icon: LayoutDashboard },
      { id: "chat", name: "Group Chat", type: "chat", icon: MessageSquare },
      { id: "run-schedule", name: "Run Schedule", type: "calendar", icon: CalendarDays },
      { id: "training-tips", name: "Training Tips", type: "forum", icon: MessagesSquare },
      { id: "announcements", name: "Announcements", type: "pinboard", icon: Pin },
    ]
  },
  {
    id: "weekend-coders",
    name: "Weekend Coders",
    members: 12,
    imageSeed: "coders",
    description: "A small group for collaborative coding projects, tech talks, and hackathons on weekends.",
    subPages: [
      { id: "overview", name: "Overview", type: "overview", icon: LayoutDashboard },
      { id: "general-chat", name: "General Chat", type: "chat", icon: MessageSquare },
      { id: "project-board", name: "Project Board", type: "pinboard", icon: Pin },
      { id: "tech-discussions", name: "Tech Discussions", type: "forum", icon: MessagesSquare },
    ]
  },
  {
    id: "art-enthusiasts",
    name: "Art Enthusiasts",
    members: 78,
    imageSeed: "artgroup",
    description: "Share and discuss art, plan gallery visits, and collaborate on creative projects.",
    subPages: [
      { id: "overview", name: "Overview", type: "overview", icon: LayoutDashboard },
      { id: "main-chat", name: "Main Chat", type: "chat", icon: MessageSquare },
      { id: "gallery-visits", name: "Gallery Visits", type: "calendar", icon: CalendarDays },
      { id: "critique-corner", name: "Critique Corner", type: "forum", icon: MessagesSquare },
      { id: "inspiration-board", name: "Inspiration Board", type: "pinboard", icon: Pin },
      { id: "graffiti-mannheim", name: "Graffiti Artists Mannheim", type: "chat", icon: MessageSquare },
    ]
  },
  {
    id: "bookworms-united",
    name: "Bookworms United",
    members: 150,
    imageSeed: "bookclub",
    description: "Monthly book discussions, author Q&As, and a shared love for reading.",
    subPages: [
      { id: "overview", name: "Overview", type: "overview", icon: LayoutDashboard },
      { id: "current-read-chat", name: "Current Read Chat", type: "chat", icon: MessageSquare },
      { id: "meeting-schedule", name: "Meeting Schedule", type: "calendar", icon: CalendarDays },
      { id: "genre-discussions", name: "Genre Discussions", type: "forum", icon: MessagesSquare },
    ]
  },
  {
    id: "sustainable-living",
    name: "Sustainable Living Advocates",
    members: 65,
    imageSeed: "ecogroup",
    description: "Tips, projects, and discussions on sustainable practices and eco-friendly living.",
    subPages: [
      { id: "overview", name: "Overview", type: "overview", icon: LayoutDashboard },
      { id: "tips-exchange", name: "Tips Exchange (Chat)", type: "chat", icon: MessageSquare },
      { id: "local-events", name: "Local Eco Events", type: "calendar", icon: CalendarDays },
      { id: "project-showcase", name: "Project Showcase (Forum)", type: "forum", icon: MessagesSquare },
      { id: "resource-hub", name: "Resource Hub (Pinboard)", type: "pinboard", icon: Pin },
    ]
  },
];

export const getCommunityById = (id: string): Community | undefined => {
  return mockCommunities.find(community => community.id === id);
};

export const getSubPageById = (communityId: string, subPageId: string): SubPage | undefined => {
  const community = getCommunityById(communityId);
  return community?.subPages.find(subPage => subPage.id === subPageId);
};
