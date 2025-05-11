
"use client";
import AppLayout from "@/components/layout/AppLayout";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

export default function DashboardPage() {
  const { user, isGuest } = useAuth();
  const router = useRouter();

  const userName = isGuest ? "Guest" : user?.name || "User";

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page title and description are now handled by AppLayout header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-xl text-foreground">Welcome back, {userName}!</p>
          {!isGuest && (
            <Button onClick={() => router.push('/connections')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <UserPlus className="mr-2 h-4 w-4" />
              Find Connections
            </Button>
          )}
        </div>

        {isGuest && (
          <Card className="bg-primary/10 border-primary/30">
            <CardHeader>
              <CardTitle className="text-primary">Guest Mode</CardTitle>
              <CardDescription className="text-primary/80">
                You are currently exploring ConnectMe as a guest. Some features like profile editing and personalized feeds are limited.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/signup')} className="mr-2 bg-accent hover:bg-accent/90 text-accent-foreground">Sign Up</Button>
              <Button variant="outline" onClick={() => router.push('/login')}>Login</Button>
            </CardContent>
          </Card>
        )}
        
        <ActivityFeed />
      </div>
    </AppLayout>
  );
}
