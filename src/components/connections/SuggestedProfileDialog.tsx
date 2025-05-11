
"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SuggestedProfile } from "@/ai/flows/suggest-connections";
import { findSocialMediaLinks, type ComputedSocialLink, type FindSocialMediaLinksInput } from "@/ai/flows/find-social-media-links";
import { UserPlus, X, Linkedin, Twitter, Instagram, Github, Globe, Link as LinkIcon, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SuggestedProfileDialogProps {
  profile: SuggestedProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const platformIcons: { [key: string]: JSX.Element } = {
  linkedin: <Linkedin className="h-5 w-5 text-blue-700" />,
  twitter: <Twitter className="h-5 w-5 text-sky-500" />,
  instagram: <Instagram className="h-5 w-5 text-pink-600" />,
  github: <Github className="h-5 w-5 text-neutral-800 dark:text-neutral-300" />,
  wikipedia: <Globe className="h-5 w-5 text-gray-700 dark:text-gray-400" />, // Using Globe for Wikipedia
  personal_blog_or_website: <LinkIcon className="h-5 w-5 text-green-600" />,
  other: <LinkIcon className="h-5 w-5 text-gray-500" />,
};

const getPlatformIcon = (platform: string) => {
  return platformIcons[platform.toLowerCase()] || <LinkIcon className="h-5 w-5 text-gray-500" />;
};


export default function SuggestedProfileDialog({ profile, open, onOpenChange }: SuggestedProfileDialogProps) {
  const { toast } = useToast();
  const [computedSocialLinks, setComputedSocialLinks] = useState<ComputedSocialLink[]>([]);
  const [loadingSocialLinks, setLoadingSocialLinks] = useState(false);
  const [socialLinksError, setSocialLinksError] = useState<string | null>(null);

  useEffect(() => {
    if (open && profile) {
      const fetchLinks = async () => {
        setLoadingSocialLinks(true);
        setComputedSocialLinks([]);
        setSocialLinksError(null);
        try {
          const input: FindSocialMediaLinksInput = {
            name: profile.name,
            bio: profile.bio,
            photoSeed: profile.photoSeed,
            interests: profile.interests,
            // platforms: ["linkedin", "twitter", "github", "wikipedia", "instagram"] // Optionally specify platforms
          };
          const result = await findSocialMediaLinks(input);
          setComputedSocialLinks(result.socialLinks);
        } catch (error) {
          console.error("Error fetching social media links:", error);
          setSocialLinksError("Could not fetch social media links. Please try again later.");
        } finally {
          setLoadingSocialLinks(false);
        }
      };
      fetchLinks();
    } else {
      // Reset when dialog is closed or profile is null
      setComputedSocialLinks([]);
      setLoadingSocialLinks(false);
      setSocialLinksError(null);
    }
  }, [open, profile]);

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
        
        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
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

          <div>
            <h3 className="text-md font-semibold mb-2 text-foreground">Potentially Related Links</h3>
            {loadingSocialLinks && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching for links...</span>
              </div>
            )}
            {socialLinksError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{socialLinksError}</AlertDescription>
              </Alert>
            )}
            {!loadingSocialLinks && !socialLinksError && computedSocialLinks.length === 0 && (
              <p className="text-sm text-muted-foreground">No potential social links found or suggested by AI.</p>
            )}
            {!loadingSocialLinks && computedSocialLinks.length > 0 && (
              <ul className="space-y-3">
                {computedSocialLinks.map((link, index) => (
                  <li key={index} className="flex items-start p-3 bg-muted/30 rounded-md gap-3">
                    <div className="flex-shrink-0 pt-0.5">{getPlatformIcon(link.platform)}</div>
                    <div className="flex-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline truncate block"
                        title={link.url}
                      >
                        {link.platform.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </a>
                      <p className="text-xs text-muted-foreground italic">
                        AI Justification: {link.justification}
                        <TooltipProvider>
                           <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 p-0 inline-flex items-center justify-center">
                               <Info className="h-3 w-3 text-muted-foreground/70" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs">
                              <p>{link.justification}</p>
                              <p className="mt-1 text-muted-foreground/80">Note: AI suggestions may not always be accurate. Verify the link before interacting.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2 sm:gap-0 pt-4 border-t">
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

