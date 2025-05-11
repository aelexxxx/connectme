
import type { LucideIcon } from 'lucide-react';

export interface SubPage {
  id: string;
  name: string;
  type: 'chat' | 'calendar' | 'forum' | 'pinboard' | 'overview';
  icon?: LucideIcon; // Optional: for display in navigation
  // Specific content/data for each sub-page type can be added here later
  // For example, for 'forum', it might be an array of topics.
  // For 'calendar', an array of events.
}

export interface Community {
  id: string;
  name: string;
  description: string;
  imageSeed: string;
  members: number;
  subPages: SubPage[];
}
