
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UserPlus, Zap } from "lucide-react";
import { suggestConnections, type SuggestConnectionsInput, type SuggestConnectionsOutput } from "@/ai/flows/suggest-connections";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ConnectionSuggestions() {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [profileSummary, setProfileSummary] = useState(user?.bio || "Interested in technology, networking, and personal growth.");
  const [numSuggestions, setNumSuggestions] = useState(5);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (isGuest) {
      toast({
        title: "Feature Unavailable",
        description: "Connection suggestions are not available in guest mode. Please sign up or log in.",
        variant: "destructive",
      });
      return;
    }

    if (!profileSummary.trim()) {
      setError("Profile summary cannot be empty.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setSuggestions([]);

    try {
      const input: SuggestConnectionsInput = {
        profileSummary,
        numberOfSuggestions: numSuggestions,
      };
      const result: SuggestConnectionsOutput = await suggestConnections(input);
      setSuggestions(result.suggestions);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError("Failed to fetch suggestions. Please try again.");
      toast({
        title: "Error",
        description: "Could not fetch connection suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Smart Connection Suggestions
        </CardTitle>
        <CardDescription>
          Let our AI help you find relevant connections based on your profile or a summary you provide.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="profileSummary" className="text-base font-medium">Your Profile Summary</Label>
          <Textarea
            id="profileSummary"
            value={profileSummary}
            onChange={(e) => setProfileSummary(e.target.value)}
            placeholder="e.g., Software engineer passionate about AI, open-source, and hiking. Looking to connect with like-minded professionals."
            rows={4}
            className="mt-1"
            disabled={isGuest || isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {isGuest ? "Login to use your actual profile bio." : "Defaults to your bio, or provide a custom summary."}
          </p>
        </div>
        
        {/* Number of suggestions input (optional, could be fixed) */}
        {/* <div>
          <Label htmlFor="numSuggestions">Number of Suggestions (1-10)</Label>
          <Input
            id="numSuggestions"
            type="number"
            value={numSuggestions}
            onChange={(e) => setNumSuggestions(Math.max(1, Math.min(10, parseInt(e.target.value, 10))))}
            min="1"
            max="10"
            className="mt-1 w-24"
            disabled={isGuest || isLoading}
          />
        </div> */}

        <Button onClick={handleSubmit} disabled={isLoading || isGuest || !profileSummary.trim()} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          Get Suggestions
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      {suggestions.length > 0 && (
        <CardFooter className="flex flex-col items-start pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Suggested Connections:</h3>
          <ul className="space-y-3 w-full">
            {suggestions.map((name, index) => (
              <li key={index} className="flex items-center p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={`https://picsum.photos/seed/${name.replace(/\s+/g, '')}/40/40`} alt={name} data-ai-hint="person avatar" />
                  <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{name}</span>
                {/* In a real app, add a "Connect" button or link to their profile */}
                 <Button variant="outline" size="sm" className="ml-auto">View Profile</Button>
              </li>
            ))}
          </ul>
        </CardFooter>
      )}
    </Card>
  );
}
