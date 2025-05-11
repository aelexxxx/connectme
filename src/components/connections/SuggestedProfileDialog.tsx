
"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SuggestedProfile } from "@/ai/flows/suggest-connections";
import { UserPlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SuggestedProfileDialogProps {
  profile: SuggestedProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SuggestedProfileDialog({ profile, open, onOpenChange }: SuggestedProfileDialogProps) {
  const { toast } = useToast();

  if (!profile) return null;

  const handleConnect = () => {
    toast({
      title: "Connection Request Sent (Mock)",
      description: `You've sent a connection request to ${profile.name}.`,
    });
    onOpenChange(false); // Close dialog after action
  };

  const photoUrl = `https://picsum.photos/seed/${profile.photoSeed}/200/200`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile: {profile.name}</DialogTitle>
          <DialogDescription>
            Learn more about {profile.name} and decide if you'd like to connect.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={photoUrl} alt={profile.name} data-ai-hint="person avatar"/>
              <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">{profile.name}</h2>
              {profile.status && <p className="text-sm text-muted-foreground italic">"{profile.status}"</p>}
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold mb-1 text-foreground">Bio</h3>
            <p className="text-sm text-foreground/80">{profile.bio}</p>
          </div>

          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-2 text-foreground">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">{interest}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              <X className="mr-2 h-4 w-4" /> Close
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleConnect} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <UserPlus className="mr-2 h-4 w-4" /> Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
