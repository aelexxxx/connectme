"use client"; // Required for AuthContext and useEffect
import type { ReactNode } from 'react'; // Import ReactNode
import { useEffect } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuth, useAuthSettings } from '@/contexts/AuthContext'; // Import useAuthSettings
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

function ThemeApplicator({ children }: { children: ReactNode }) {
  const { settings, loading } = useAuthSettings(); // Use useAuthSettings to get settings with defaults

  useEffect(() => {
    if (loading) return;

    const root = window.document.documentElement;
    
    const currentColorScheme = settings.theme;
    const currentThemeStyle = settings.themeStyle;
    const glassmorphismOptions = settings.glassmorphismOptions;

    // Apply color scheme (light/dark/system)
    root.classList.remove('light', 'dark');
    let activeColorScheme = currentColorScheme;
    if (currentColorScheme === 'system') {
      activeColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.classList.add(activeColorScheme);

    // Apply theme style (default/glassmorphism)
    if (currentThemeStyle === 'glassmorphism') {
      root.classList.add('theme-glassmorphism');
      
      // Determine default glass colors based on active color scheme
      const defaultGlassColorOne = activeColorScheme === 'dark' ? 'hsl(var(--glass-color-one-dark))' : 'hsl(var(--glass-color-one-light))';
      const defaultGlassColorTwo = activeColorScheme === 'dark' ? 'hsl(var(--glass-color-two-dark))' : 'hsl(var(--glass-color-two-light))';
      const defaultGlassBorderColor = activeColorScheme === 'dark' ? 'hsl(var(--glass-border-color-dark))' : 'hsl(var(--glass-border-color-light))';
      const defaultGlassShadow = activeColorScheme === 'dark' ? 'var(--glass-shadow-dark)' : 'var(--glass-shadow-light)';
      const defaultGlassTextColor = activeColorScheme === 'dark' ? 'var(--glass-text-color-dark)' : 'var(--glass-text-color-light)';
      const defaultBlurIntensity = activeColorScheme === 'dark' ? 'var(--glass-blur-intensity-dark)' : 'var(--glass-blur-intensity-light)';

      root.style.setProperty('--dynamic-glass-color-one', glassmorphismOptions?.gradientColor1 || defaultGlassColorOne);
      root.style.setProperty('--dynamic-glass-color-two', glassmorphismOptions?.gradientColor2 || defaultGlassColorTwo);
      root.style.setProperty('--dynamic-glass-blur', `${glassmorphismOptions?.blurIntensity || parseFloat(getComputedStyle(root).getPropertyValue(activeColorScheme === 'dark' ? '--glass-blur-intensity-dark' : '--glass-blur-intensity-light').replace('px',''))}px`);
      
      root.style.setProperty('--dynamic-glass-border-color', defaultGlassBorderColor); // Use theme defaults for border
      root.style.setProperty('--dynamic-glass-shadow', defaultGlassShadow); // Use theme defaults for shadow
      root.style.setProperty('--dynamic-glass-text-color', defaultGlassTextColor); // Use theme defaults for text

      if (glassmorphismOptions?.animatedGradient) {
        root.classList.add('animate-gradient');
      } else {
        root.classList.remove('animate-gradient');
      }
    } else {
      root.classList.remove('theme-glassmorphism', 'animate-gradient');
      // Clear dynamic glass properties when not in glassmorphism mode
      root.style.removeProperty('--dynamic-glass-color-one');
      root.style.removeProperty('--dynamic-glass-color-two');
      root.style.removeProperty('--dynamic-glass-blur');
      root.style.removeProperty('--dynamic-glass-border-color');
      root.style.removeProperty('--dynamic-glass-shadow');
      root.style.removeProperty('--dynamic-glass-text-color');
    }

  }, [settings, loading]);

  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <head>
        <title>ConnectMe</title>
        <meta name="description" content="Connect, Share, Grow your Network." />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <AuthProvider>
          <ThemeApplicator>
            {children}
          </ThemeApplicator>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

