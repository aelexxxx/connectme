
"use client";
import type { SocialLink } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, PlusCircle, Link as LinkIcon, Globe, Github, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const socialPlatforms = [
  { value: "github", label: "GitHub", icon: <Github className="h-4 w-4" /> },
  { value: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
  { value: "twitter", label: "Twitter/X", icon: <Twitter className="h-4 w-4" /> },
  { value: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
  { value: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
  { value: "website", label: "Website", icon: <Globe className="h-4 w-4" /> },
  { value: "other", label: "Other", icon: <LinkIcon className="h-4 w-4" /> },
];

const getPlatformIcon = (platform: string) => {
  const p = socialPlatforms.find(sp => sp.value === platform);
  return p ? p.icon : <LinkIcon className="h-4 w-4" />;
};

interface SocialLinksManagerProps {
  links: SocialLink[];
}

export default function SocialLinksManager({ links }: SocialLinksManagerProps) {
  const { addSocialLink, updateSocialLink, deleteSocialLink, isGuest } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<string>(socialPlatforms[0].value);
  const [currentUrl, setCurrentUrl] = useState<string>("");

  const handleSubmit = () => {
    if (!currentUrl.trim()) {
      toast({ title: "Validation Error", description: "URL cannot be empty.", variant: "destructive" });
      return;
    }
    try {
      new URL(currentUrl); // Validate URL
    } catch (_) {
      toast({ title: "Validation Error", description: "Please enter a valid URL (e.g., https://example.com).", variant: "destructive" });
      return;
    }

    if (editingLink) {
      updateSocialLink(editingLink.id, { platform: currentPlatform, url: currentUrl });
      toast({ title: "Link Updated", description: "Social link updated successfully." });
    } else {
      addSocialLink({ platform: currentPlatform, url: currentUrl });
      toast({ title: "Link Added", description: "New social link added." });
    }
    resetForm();
  };

  const resetForm = () => {
    setEditingLink(null);
    setCurrentPlatform(socialPlatforms[0].value);
    setCurrentUrl("");
    setIsDialogOpen(false);
  };

  const handleEdit = (link: SocialLink) => {
    setEditingLink(link);
    setCurrentPlatform(link.platform);
    setCurrentUrl(link.url);
    setIsDialogOpen(true);
  };

  const handleDelete = (linkId: string) => {
    deleteSocialLink(linkId);
    toast({ title: "Link Deleted", description: "Social link removed." });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Social Links</h3>
        {!isGuest && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingLink ? "Edit" : "Add"} Social Link</DialogTitle>
                <DialogDescription>
                  {editingLink ? "Update your" : "Add a new"} social media or website link.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="platform" className="text-right">Platform</Label>
                  <Select value={currentPlatform} onValueChange={setCurrentPlatform}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {socialPlatforms.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">URL</Label>
                  <Input
                    id="url"
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90 text-accent-foreground">{editingLink ? "Save Changes" : "Add Link"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {links && links.length > 0 ? (
        <ul className="space-y-3">
          {links.map((link) => (
            <li key={link.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary truncate">
                {getPlatformIcon(link.platform)}
                <span className="font-medium capitalize">{socialPlatforms.find(p=>p.value === link.platform)?.label || link.platform}</span>
                <span className="text-xs text-muted-foreground truncate hidden sm:inline">{link.url}</span>
              </a>
              {!isGuest && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(link)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(link.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No social links added yet.</p>
      )}
    </div>
  );
}
