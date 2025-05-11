
"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast"; // Ensure this path is correct

interface QrCodeDisplayProps {
  profileUrl: string;
}

export default function QrCodeDisplay({ profileUrl }: QrCodeDisplayProps) {
  const { toast } = useToast();
  // In a real app, you'd generate a QR code using a library like 'qrcode.react'
  // For this example, we'll use a placeholder image.
  // A more dynamic placeholder could use an API e.g. `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`
  const qrCodePlaceholder = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl || 'https://example.com')}&format=svg`;


  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My ConnectMe Profile',
        text: 'Check out my profile on ConnectMe!',
        url: profileUrl,
      })
      .then(() => toast({ title: "Profile Shared", description: "Link shared successfully!" }))
      .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(profileUrl).then(() => {
         toast({ title: "Link Copied!", description: "Profile URL copied to clipboard." });
      }).catch(err => {
         toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" });
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl).then(() => {
      toast({ title: "Link Copied!", description: "Profile URL copied to clipboard." });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" });
    });
  };


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-center">Share Your Profile</CardTitle>
        <CardDescription className="text-center">Let others connect with you easily.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="bg-white p-3 rounded-lg shadow-md border">
          {/* Using an img tag directly for SVG from URL */}
          <img 
            src={qrCodePlaceholder} 
            alt="QR Code for profile" 
            width={180} 
            height={180} 
            data-ai-hint="qr code"
            className="rounded" 
            />
        </div>
        <p className="text-xs text-muted-foreground text-center px-4">
          Scan this QR code or use the buttons below to share your profile link.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button onClick={handleShare} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Share2 className="mr-2 h-4 w-4" /> Share via...
        </Button>
         <Button onClick={handleCopyLink} className="w-full" variant="outline">
          <Copy className="mr-2 h-4 w-4" /> Copy Link
        </Button>
      </CardFooter>
    </Card>
  );
}

