
"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth, User as AuthUser } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, Link as LinkIcon, Briefcase, MapPin, Twitter, Linkedin, Github, Globe, Rss, UserCircle } from "lucide-react";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import QrCodeDisplay from "@/components/profile/QrCodeDisplay";
import SocialLinksManager from "@/components/profile/SocialLinksManager";
import BlogManager from "@/components/profile/BlogManager";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const socialIcons: { [key: string]: JSX.Element } = {
  twitter: <Twitter className="h-5 w-5 text-sky-500" />,
  linkedin: <Linkedin className="h-5 w-5 text-blue-700" />,
  github: <Github className="h-5 w-5 text-neutral-800 dark:text-neutral-300" />,
  website: <Globe className="h-5 w-5 text-green-600" />,
  other: <LinkIcon className="h-5 w-5 text-gray-500" />,
};


export default function ProfilePage() {
  const { user, isGuest, loading: authLoading } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Generate a more unique profile URL if user ID is available
      const userSpecificPath = user ? `/user/${user.id}` : '/profile';
      setProfileUrl(`${window.location.origin}${userSpecificPath}`); 
    }
  }, [user]);

  if (authLoading || !user && !isGuest) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-lg shadow">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-full" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (isGuest || !user) {
     return (
      <AppLayout>
        <Card className="text-center">
          <CardHeader>
            <UserCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle>Profile Page</CardTitle>
            <CardDescription>
              This is where user profiles are displayed. As a guest, you can view public profiles.
              Registered users can customize their own profiles here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Log in or sign up to create and manage your own profile.</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }


  return (
    <AppLayout>
      {/* Page title and description are now handled by AppLayout header */}
      <div className="space-y-8">
        {/* Profile Header Card */}
        <Card className="overflow-hidden shadow-xl">
          <div className="h-32 md:h-48 bg-gradient-to-r from-primary/80 to-accent/80" data-ai-hint="abstract gradient" />
          <CardContent className="p-6 pt-0">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 md:-mt-20">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-card shadow-lg">
                <AvatarImage src={user.photoUrl || `https://picsum.photos/seed/${user.name || 'user'}/160/160`} alt={user.name || 'User'} data-ai-hint="user profile" />
                <AvatarFallback className="text-4xl">{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-4 md:pt-0 text-center md:text-left">
                <h2 className="text-3xl font-bold text-foreground">{user.name}</h2>
                {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                {user.status && <p className="text-md text-accent mt-1 italic">"{user.status}"</p>}
              </div>
              {!isGuest && (
                <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="mt-4 md:mt-0">
                      <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="p-0 flex flex-col max-h-[90vh] rounded-t-xl">
                    <div className="pt-4 px-4">
                      <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/30 mb-4 cursor-grab" />
                      <SheetHeader className="text-left">
                        <SheetTitle>Edit Your Profile</SheetTitle>
                        <SheetDescription>
                          Make changes to your profile here. Click save when you&apos;re done.
                        </SheetDescription>
                      </SheetHeader>
                    </div>
                    
                    <ScrollArea className="flex-1 overflow-y-auto">
                      <div className="p-4">
                        <ProfileEditForm 
                          user={user} 
                          onSave={() => setIsEditDialogOpen(false)} 
                          formId="profile-edit-form"
                        />
                      </div>
                    </ScrollArea>
                    
                    <SheetFooter className="p-4 border-t bg-background">
                      <SheetClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </SheetClose>
                      <Button type="submit" form="profile-edit-form" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        Save Changes
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Profile Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column (About, QR) */}
          <div className="md:col-span-1 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                {user.bio ? (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{user.bio}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No bio provided yet.</p>
                )}
              </CardContent>
            </Card>

            <QrCodeDisplay profileUrl={profileUrl} />
          </div>

          {/* Right Column (Social Links, Blog) */}
          <div className="md:col-span-2 space-y-8">
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>My Links</CardTitle>
              </CardHeader>
              <CardContent>
                <SocialLinksManager links={user.socialLinks || []} />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
               <CardHeader>
                <CardTitle>My Thoughts</CardTitle>
                 <CardDescription>Recent blog posts and updates.</CardDescription>
              </CardHeader>
              <CardContent>
                <BlogManager posts={user.blogPosts || []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
