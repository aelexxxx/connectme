
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
import { Sun, Moon, Laptop, Bell, Lock, Trash2, Palette, ShieldAlert, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { settings, updateUserSettings, isGuest, user, deleteAccount } = useAuthSettings();
  const { toast } = useToast();
  const router = useRouter();

  if (isGuest || !user) {
    // This should ideally be handled by AuthProvider redirects, but as a fallback:
    if (typeof window !== "undefined") router.push("/login");
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

  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
    updateUserSettings({ notifications: { ...settings.notifications, [key]: value } });
     toast({ title: "Notification Settings Updated" });
  };

  const handlePrivacyChange = (key: keyof typeof settings.privacy, value: boolean) => {
    updateUserSettings({ privacy: { ...settings.privacy, [key]: value } });
    toast({ title: "Privacy Settings Updated" });
  };
  
  const handleDeleteAccount = () => {
    deleteAccount(); // This will also redirect to login via AuthContext logic
    toast({ title: "Account Deleted", description: "Your account has been successfully deleted.", variant: "destructive"});
  };


  return (
    <AppLayout>
      <div className="space-y-10">
        <header>
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center">
            <UserCog className="mr-3 h-10 w-10 text-primary" />
            Settings
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            Manage your account preferences and settings.
          </p>
        </header>

        <Separator />

        {/* Appearance Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Palette className="mr-2 h-6 w-6 text-primary/80" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label className="text-base font-medium">Theme</Label>
            <RadioGroup
              value={settings.theme}
              onValueChange={(value: 'light' | 'dark' | 'system') => handleThemeChange(value)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
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
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Bell className="mr-2 h-6 w-6 text-primary/80" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose how you want to be notified.</CardDescription>
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
            <CardDescription>Control how your information is shared.</CardDescription>
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
            <CardDescription className="text-destructive/90">Manage your account data and status.</CardDescription>
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
