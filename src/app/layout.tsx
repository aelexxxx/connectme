"use client"; // Required for AuthContext and useEffect
import type { ReactNode } from 'react'; // Import ReactNode
import { useEffect } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuth, DEFAULT_USER_SETTINGS } from '@/contexts/AuthContext';
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
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const root = window.document.documentElement;
    const currentColorScheme = user?.settings?.theme || DEFAULT_USER_SETTINGS.theme;
    const currentThemeStyle = user?.settings?.themeStyle || DEFAULT_USER_SETTINGS.themeStyle;
    const glassmorphismOptions = user?.settings?.glassmorphismOptions || DEFAULT_USER_SETTINGS.glassmorphismOptions;

    // Apply color scheme (light/dark/system)
    root.classList.remove('light', 'dark');
    if (currentColorScheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(currentColorScheme);
    }

    // Apply theme style (default/glassmorphism)
    if (currentThemeStyle === 'glassmorphism') {
      root.classList.add('theme-glassmorphism');
      
      // Apply dynamic CSS variables for glassmorphism
      root.style.setProperty('--dynamic-glass-color-one', glassmorphismOptions?.gradientColor1 || (root.classList.contains('dark') ? 'hsl(var(--glass-color-one-dark))' : 'hsl(var(--glass-color-one-light))'));
      root.style.setProperty('--dynamic-glass-color-two', glassmorphismOptions?.gradientColor2 || (root.classList.contains('dark') ? 'hsl(var(--glass-color-two-dark))' : 'hsl(var(--glass-color-two-light))'));
      root.style.setProperty('--dynamic-glass-blur', `${glassmorphismOptions?.blurIntensity || 10}px`);
      
      // Border and shadow also depend on light/dark mode if not overridden by specific options
      if (root.classList.contains('dark')) {
        root.style.setProperty('--dynamic-glass-border-color', 'hsl(var(--glass-border-color-dark))');
        root.style.setProperty('--dynamic-glass-shadow', 'var(--glass-shadow-dark)');
        root.style.setProperty('--dynamic-glass-text-color', 'var(--glass-text-color-dark)');
      } else {
        root.style.setProperty('--dynamic-glass-border-color', 'hsl(var(--glass-border-color-light))');
        root.style.setProperty('--dynamic-glass-shadow', 'var(--glass-shadow-light)');
        root.style.setProperty('--dynamic-glass-text-color', 'var(--glass-text-color-light)');
      }

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

  }, [user, loading]);

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
