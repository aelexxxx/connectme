
"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthSettings } from "@/contexts/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sun, Moon, Laptop, Bell, Lock, Trash2, Palette, ShieldAlert, Layers, Wand2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"; 
import React, { useEffect } from "react"; // Import useEffect

export default function SettingsPage() {
  const { settings, updateUserSettings, isGuest, user, deleteAccount, loading: authLoading } = useAuthSettings();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth state to load before redirecting
    if (authLoading) {
      return;
    }
    if (isGuest || !user) {
      router.push("/login");
    }
  }, [isGuest, user, router, authLoading]);


  if (authLoading || isGuest || !user) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full">
            <p>Loading or redirecting...</p>
        </div>
      </AppLayout>
    );
  }

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateUserSettings({ theme });
    toast({ title: "Appearance Updated", description: `Theme set to ${theme}.` });
  };

  const handleThemeStyleChange = (style: 'default' | 'glassmorphism') => {
    updateUserSettings({ themeStyle: style });
    toast({ title: "Theme Style Updated", description: `Style set to ${style}.` });
  };

  const handleGlassmorphismOptionChange = (option: keyof NonNullable<typeof settings.glassmorphismOptions>, value: any) => {
    updateUserSettings({
      glassmorphismOptions: {
        ...settings.glassmorphismOptions,
        [option]: value,
      },
    });
    toast({ title: "Glassmorphism Settings Updated" });
  };

  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
    updateUserSettings({ notifications: { ...settings.notifications, [key]: value } });
     toast({ title: "Notification Settings Updated" });
  };

  const handlePrivacyChange = (key: keyof typeof settings.privacy, value: boolean) => {
    updateUserSettings({ privacy: { ...settings.privacy, [key]: value } });
    toast({ title: "Privacy Settings Updated" });
  };
  
  const handleDeleteAccount = () => {
    deleteAccount(); 
    toast({ title: "Account Deleted", description: "Your account has been successfully deleted.", variant: "destructive"});
    // router.push('/login'); // AuthContext will handle redirect on logout/delete
  };


  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Appearance Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Palette className="mr-2 h-6 w-6 text-primary/80" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">Color Scheme</Label>
              <RadioGroup
                value={settings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => handleThemeChange(value)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2"
              >
                {(['light', 'dark', 'system'] as const).map((themeOption) => (
                  <Label
                    key={themeOption}
                    htmlFor={`theme-${themeOption}`}
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <RadioGroupItem value={themeOption} id={`theme-${themeOption}`} className="sr-only" />
                    {themeOption === 'light' && <Sun className="mb-2 h-7 w-7" />}
                    {themeOption === 'dark' && <Moon className="mb-2 h-7 w-7" />}
                    {themeOption === 'system' && <Laptop className="mb-2 h-7 w-7" />}
                    <span className="font-semibold capitalize">{themeOption}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <Separator />
            <div>
              <Label className="text-base font-medium">UI Style</Label>
              <RadioGroup
                value={settings.themeStyle}
                onValueChange={(value: 'default' | 'glassmorphism') => handleThemeStyleChange(value)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"
              >
                 <Label
                    htmlFor="theme-style-default"
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <RadioGroupItem value="default" id="theme-style-default" className="sr-only" />
                    <Layers className="mb-2 h-7 w-7" />
                    <span className="font-semibold">Default</span>
                  </Label>
                  <Label
                    htmlFor="theme-style-glassmorphism"
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <RadioGroupItem value="glassmorphism" id="theme-style-glassmorphism" className="sr-only" />
                    <Wand2 className="mb-2 h-7 w-7" />
                    <span className="font-semibold">Glassmorphism</span>
                  </Label>
              </RadioGroup>
            </div>

            {settings.themeStyle === 'glassmorphism' && (
              <Card className="p-4 bg-muted/30 border-dashed">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg flex items-center"><Sparkles className="mr-2 h-5 w-5 text-primary/70" />Glassmorphism Options</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="glass-color-1">Gradient Color 1</Label>
                      <Input
                        id="glass-color-1"
                        type="color"
                        value={settings.glassmorphismOptions?.gradientColor1 || '#60a5fa'} // Default to a visible color for picker
                        onChange={(e) => handleGlassmorphismOptionChange('gradientColor1', e.target.value)}
                        className="mt-1 w-full h-10 p-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="glass-color-2">Gradient Color 2</Label>
                      <Input
                        id="glass-color-2"
                        type="color"
                        value={settings.glassmorphismOptions?.gradientColor2 || '#c084fc'} // Default to a visible color for picker
                        onChange={(e) => handleGlassmorphismOptionChange('gradientColor2', e.target.value)}
                        className="mt-1 w-full h-10 p-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <Label htmlFor="animated-gradient" className="text-sm cursor-pointer">Flowing Gradient Animation</Label>
                    <Switch
                      id="animated-gradient"
                      checked={settings.glassmorphismOptions?.animatedGradient || false}
                      onCheckedChange={(value) => handleGlassmorphismOptionChange('animatedGradient', value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Bell className="mr-2 h-6 w-6 text-primary/80" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { id: "newConnectionEmail", label: "New Connection Emails", settingKey: "newConnectionEmail" as keyof typeof settings.notifications },
              { id: "activityUpdateEmail", label: "Activity Update Emails", settingKey: "activityUpdateEmail" as keyof typeof settings.notifications },
              { id: "inAppNotifications", label: "In-App Push Notifications", settingKey: "inAppNotifications" as keyof typeof settings.notifications },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <Label htmlFor={item.id} className="text-base flex-1 cursor-pointer">{item.label}</Label>
                <Switch
                  id={item.id}
                  checked={settings.notifications[item.settingKey]}
                  onCheckedChange={(value) => handleNotificationChange(item.settingKey, value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Lock className="mr-2 h-6 w-6 text-primary/80" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { id: "allowProfileSuggestions", label: "Allow AI to suggest your profile", settingKey: "allowProfileSuggestions" as keyof typeof settings.privacy },
              { id: "profileDiscoverable", label: "Make profile discoverable (e.g., by search engines)", settingKey: "profileDiscoverable" as keyof typeof settings.privacy },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <Label htmlFor={item.id} className="text-base flex-1 cursor-pointer">{item.label}</Label>
                <Switch
                  id={item.id}
                  checked={settings.privacy[item.settingKey]}
                  onCheckedChange={(value) => handlePrivacyChange(item.settingKey, value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="border-destructive shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-destructive">
              <ShieldAlert className="mr-2 h-6 w-6" />
              Account Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground mt-3">
                Note: For this demo, deleting your account will log you out and clear local data.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
