
"use client";
import AppLayout from "@/components/layout/AppLayout";
import ConnectionSuggestions from "@/components/connections/ConnectionSuggestions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ConnectionsPage() {
  const { isGuest } = useAuth();
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Discover Connections</h1>
          <p className="text-muted-foreground">Expand your network and find interesting people to connect with.</p>
        </div>

        {isGuest && (
           <Card className="bg-primary/10 border-primary/30">
            <CardHeader>
              <CardTitle className="text-primary">Feature Limited in Guest Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-primary/80">
                AI-powered connection suggestions are best experienced when logged in, as they can be personalized to your profile.
                Please <a href="/login" className="underline font-semibold">log in</a> or <a href="/signup" className="underline font-semibold">sign up</a> to use this feature fully.
              </p>
            </CardContent>
          </Card>
        )}
        
        <ConnectionSuggestions />

        {/* Placeholder for existing connections list - Future Feature */}
        {/* 
        <Card>
          <CardHeader>
            <CardTitle>Your Connections</CardTitle>
            <CardDescription>People you are currently connected with.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You have no connections yet. Start by exploring suggestions!</p>
            // List of connections would go here
          </CardContent>
        </Card>
        */}
      </div>
    </AppLayout>
  );
}
