
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, UserCheck, Edit3 } from "lucide-react";

export interface Activity {
  id: string;
  userName: string;
  userAvatar: string;
  action: "updated profile" | "new blog post" | "new connection";
  details?: string; // e.g., blog post title or connected user name
  timestamp: string;
}

// Mock data for demonstration
export const mockActivities: Activity[] = [
  {
    id: '1',
    userName: 'Alice Wonderland',
    userAvatar: 'https://picsum.photos/seed/alice/40/40',
    action: 'updated profile',
    details: 'Bio updated with new skills!',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    userName: 'Bob The Builder',
    userAvatar: 'https://picsum.photos/seed/bob/40/40',
    action: 'new blog post',
    details: 'My Journey into Web Development',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
  },
  {
    id: '3',
    userName: 'Charlie Brown',
    userAvatar: 'https://picsum.photos/seed/charlie/40/40',
    action: 'new connection',
    details: 'Connected with Snoopy.',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
  },
    {
    id: '4',
    userName: 'Diana Prince',
    userAvatar: 'https://picsum.photos/seed/diana/40/40',
    action: 'updated profile',
    details: 'Added new profile picture.',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
];

const ActivityIcon = ({ action }: { action: Activity['action'] }) => {
  switch (action) {
    case 'updated profile':
      return <Edit3 className="h-5 w-5 text-blue-500" />;
    case 'new blog post':
      return <MessageSquare className="h-5 w-5 text-green-500" />;
    case 'new connection':
      return <UserCheck className="h-5 w-5 text-purple-500" />;
    default:
      return null;
  }
};

export default function ActivityFeed() {
  // In a real app, fetch activities
  const activities = mockActivities;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Updates from your network.</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground">No recent activity from your connections yet.</p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 pt-1">
                    <ActivityIcon action={activity.action} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                       <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.userAvatar} alt={activity.userName} data-ai-hint="user avatar"/>
                        <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">{activity.userName}</span>
                        <span className="text-muted-foreground"> {activity.action === "updated profile" ? "updated their profile" : activity.action === "new blog post" ? "posted a new blog entry" : "made a new connection"}</span>
                        {activity.action === "new blog post" && activity.details && (
                           <span className="text-muted-foreground">: <em className="text-primary">{activity.details}</em></span>
                        )}
                         {activity.action === "new connection" && activity.details && (
                           <span className="text-muted-foreground"> with <em className="text-primary">{activity.details}</em></span>
                        )}
                      </p>
                    </div>
                    {activity.action === "updated profile" && activity.details && (
                       <p className="text-sm text-muted-foreground italic">"{activity.details}"</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {index < activities.length - 1 && <Separator className="my-4" />}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
