
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Terminal, Users, Share2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const { enterGuestMode } = useAuth();

  const handleGuestMode = () => {
    enterGuestMode();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <header className="container mx-auto px-4 sm:px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
          <Terminal className="h-7 w-7" />
          <span>ConnectMe</span>
        </div>
        <div className="space-x-2">
          <Button variant="ghost" onClick={() => router.push('/login')}>Login</Button>
          <Button onClick={() => router.push('/signup')} className="bg-accent hover:bg-accent/90 text-accent-foreground">Sign Up</Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
          Build Your Network, <span className="text-primary">Share Your Story.</span>
        </h1>
        <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10">
          ConnectMe helps you create a stunning personal profile, share it effortlessly,
          and discover meaningful connections.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button size="lg" onClick={() => router.push('/signup')} className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transform hover:scale-105 transition-transform duration-150">
            Get Started Free
          </Button>
          <Button size="lg" variant="outline" onClick={handleGuestMode} className="shadow-lg transform hover:scale-105 transition-transform duration-150">
            Explore as Guest
          </Button>
        </div>
        
        <div className="relative w-full max-w-3xl aspect-video rounded-xl shadow-2xl overflow-hidden border-4 border-card">
          <Image 
            src="https://picsum.photos/seed/connectme-hero/1200/675" 
            alt="ConnectMe app interface showcase"
            layout="fill"
            objectFit="cover"
            data-ai-hint="networking app interface"
            priority
          />
           <div className="absolute inset-0 bg-primary/20"></div>
        </div>
      </main>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why ConnectMe?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg  hover:shadow-xl transition-shadow">
              <div className="p-3 mb-4 bg-primary/10 rounded-full text-primary">
                <Users className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Customizable Profiles</h3>
              <p className="text-muted-foreground">Showcase your personality, skills, and achievements with a profile that’s uniquely yours.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg  hover:shadow-xl transition-shadow">
              <div className="p-3 mb-4 bg-primary/10 rounded-full text-primary">
                <Share2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Easy Sharing</h3>
              <p className="text-muted-foreground">Connect with others instantly using QR codes and simple profile links.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg  hover:shadow-xl transition-shadow">
              <div className="p-3 mb-4 bg-primary/10 rounded-full text-primary">
                <Zap className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Smart Connections</h3>
              <p className="text-muted-foreground">Discover relevant people with AI-powered suggestions based on your interests.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} ConnectMe. Your Network, Amplified.</p>
      </footer>
    </div>
  );
}
