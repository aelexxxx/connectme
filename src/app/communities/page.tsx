
"use client";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Shapes, Search, PlusCircle, Users, MessageCircle, Target, Pin, MessagesSquare, CalendarDays, Settings2, Library, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, Suspense } from "react"; // Added Suspense
import { mockCommunities } from "@/lib/communityData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter } from 'next/navigation';

interface CommunityFeatureHighlightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const CommunityFeatureHighlightCard: React.FC<CommunityFeatureHighlightCardProps> = ({ icon, title, description }) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="flex flex-row items-start gap-3 pb-3">
        <div className="p-2 bg-primary/10 rounded-md text-primary mt-1">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

// Assuming user is part of first two communities for demo
const userCommunityIds = mockCommunities.length > 0 ? [mockCommunities[0].id, ...(mockCommunities.length > 1 ? [mockCommunities[1].id] : [])] : [];
const mockUserCommunities = mockCommunities.filter(c => userCommunityIds.includes(c.id));
const mockDiscoverCommunities = mockCommunities.filter(c => !userCommunityIds.includes(c.id));


function CommunitiesContent() {
  const { user, isGuest } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'your-communities');

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab && ['your-communities', 'discover'].includes(currentTab)) {
      setActiveTab(currentTab);
    } else {
      setActiveTab('your-communities');
      // router.replace('/communities?tab=your-communities', { scroll: false }); // Keep this commented or active based on desired behavior
    }
  }, [searchParams, router]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/communities?tab=${value}`, { scroll: false });
  };

  return (
    <div className="space-y-8">
      {isGuest && (
        <Card className="bg-primary/10 border-primary/30">
          <CardHeader>
            <CardTitle className="text-primary">Feature Limited in Guest Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-primary/80">
              Joining, creating, and managing communities is best experienced when logged in.
              Please <Link href="/login" className="underline font-semibold">log in</Link> or <Link href="/signup" className="underline font-semibold">sign up</Link> to use this feature fully.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2 mb-6 sticky top-[calc(theme(spacing.16)_-_1px)] sm:top-16 z-10 bg-background/80 backdrop-blur-sm py-2 -mx-2 px-2 md:-mx-0 md:px-0">
            <TabsTrigger value="your-communities" className="py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-md">
            <Library className="mr-2 h-5 w-5" /> Your Communities
          </TabsTrigger>
          <TabsTrigger value="discover" className="py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-md">
            <Search className="mr-2 h-5 w-5" /> Discover & Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="your-communities" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Library className="h-6 w-6 text-primary" /> Your Communities
              </CardTitle>
              {!isGuest && <CardDescription>Communities you are currently a part of.</CardDescription>}
            </CardHeader>
            <CardContent>
              {!isGuest ? (
                mockUserCommunities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockUserCommunities.map(community => (
                      <Card key={community.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                          <div className="relative h-40 w-full">
                              <Image
                                  src={`https://picsum.photos/seed/${community.imageSeed}/400/200`}
                                  alt={community.name}
                                  fill
                                  style={{objectFit: 'cover'}}
                                  data-ai-hint="community banner"
                                  />
                          </div>
                        <CardHeader className="pb-2 pt-4">
                          <CardTitle className="text-lg">{community.name}</CardTitle>
                          <CardDescription className="text-xs">{community.members} members</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-sm text-muted-foreground line-clamp-3">{community.description}</p>
                        </CardContent>
                        <CardFooter className="pt-3">
                          <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={`/communities/${community.id}`}>View Community</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">You haven't joined or created any communities yet. Explore in the 'Discover' tab or create your own!</p>
                )
              ) : (
                <p className="text-muted-foreground text-center py-8">Login to see the communities you are a part of and manage them here.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discover" className="mt-0 space-y-8">
          {/* Discover Communities Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Search className="h-6 w-6 text-primary" /> Discover Communities
              </CardTitle>
              <CardDescription>Find communities based on your interests or create a new one.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input type="search" placeholder="Search for communities (e.g., 'hiking', 'book club')" className="flex-grow" />
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
              </div>
              {!isGuest && (
                <Button variant="outline" className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Community
                </Button>
              )}
              <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Suggestions for you:</h3>
                  {mockDiscoverCommunities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {mockDiscoverCommunities.map(community => (
                              <Card key={community.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
                                  <div className="relative h-40 w-full">
                                      <Image
                                          src={`https://picsum.photos/seed/${community.imageSeed}/400/200`}
                                          alt={community.name}
                                          fill
                                          style={{objectFit: 'cover'}}
                                          data-ai-hint="community group photo"
                                          />
                                  </div>
                                  <CardHeader className="pb-2 pt-4">
                                      <CardTitle className="text-lg">{community.name}</CardTitle>
                                      <CardDescription className="text-xs">{community.members} members</CardDescription>
                                  </CardHeader>
                                  <CardContent className="flex-grow">
                                      <p className="text-sm text-muted-foreground line-clamp-3">{community.description}</p>
                                  </CardContent>
                                  <CardFooter className="pt-3">
                                      <Button asChild size="sm" className="w-full bg-accent hover:bg-accent/80 text-accent-foreground">
                                        <Link href={`/communities/${community.id}`}>View Community</Link>
                                      </Button>
                                  </CardFooter>
                              </Card>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No new communities to suggest right now. Check back later or try a search!</p>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Community Features Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shapes className="h-6 w-6 text-primary" /> Connect & Collaborate
              </CardTitle>
              <CardDescription>
                Communities on ConnectMe offer diverse ways to interact and achieve common goals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <CommunityFeatureHighlightCard
                  icon={<MessageCircle className="h-7 w-7" />}
                  title="Group Chat"
                  description="Stay connected with real-time private or group chats for your members."
                />
                <CommunityFeatureHighlightCard
                  icon={<Target className="h-7 w-7" />}
                  title="Shared Goals & Planning"
                  description="Organize trips, manage shared funds, or plan events together seamlessly."
                />
                <CommunityFeatureHighlightCard
                  icon={<Pin className="h-7 w-7" />}
                  title="Pin Board"
                  description="Share important announcements and updates that stay visible to all members."
                />
                <CommunityFeatureHighlightCard
                  icon={<MessagesSquare className="h-7 w-7" />}
                  title="Discussion Forums"
                  description="Engage in topic-based discussions and foster community knowledge exchange."
                />
                <CommunityFeatureHighlightCard
                  icon={<CalendarDays className="h-7 w-7" />}
                  title="Shared Calendar"
                  description="Keep track of events, meetings, and deadlines with a collaborative calendar."
                />
                <CommunityFeatureHighlightCard
                  icon={<Settings2 className="h-7 w-7" />}
                  title="Customizable"
                  description="Tailor community settings, privacy levels, and member roles to fit your group's unique needs."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CommunitiesPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading communities...</span>
        </div>
      }>
        <CommunitiesContent />
      </Suspense>
    </AppLayout>
  );
}
