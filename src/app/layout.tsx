"use client"; // Required for AuthContext and useEffect
import type { ReactNode } from 'react'; // Import ReactNode
import { useEffect } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuthSettings } from '@/contexts/AuthContext'; // Import useAuthSettings
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
  const { settings, loading } = useAuthSettings(); 

  useEffect(() => {
    if (loading) return;

    const root = window.document.documentElement;
    const body = window.document.body;
    
    const currentColorScheme = settings.theme;
    const currentThemeStyle = settings.themeStyle;
    const glassmorphismOptions = settings.glassmorphismOptions;

    // Determine active color scheme (light or dark)
    let activeColorScheme = currentColorScheme;
    if (currentColorScheme === 'system') {
      activeColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark', 'theme-glassmorphism', 'animate-gradient');
    body.style.backgroundColor = ''; // Reset body background
    body.style.color = ''; // Reset body text color

    // Apply active color scheme (light/dark)
    root.classList.add(activeColorScheme);

    // Apply theme style (default/glassmorphism)
    if (currentThemeStyle === 'glassmorphism') {
      root.classList.add('theme-glassmorphism');
      body.style.backgroundColor = 'transparent'; // Ensure body is transparent to show html gradient

      // Get raw HSL values and opacity from CSS variables for the active color scheme
      const glassColorOneRaw = getComputedStyle(root).getPropertyValue(activeColorScheme === 'dark' ? '--glass-color-one-dark-raw' : '--glass-color-one-light-raw').trim();
      const glassColorTwoRaw = getComputedStyle(root).getPropertyValue(activeColorScheme === 'dark' ? '--glass-color-two-dark-raw' : '--glass-color-two-light-raw').trim();
      const glassOpacity = parseFloat(getComputedStyle(root).getPropertyValue(activeColorScheme === 'dark' ? '--glass-opacity-dark' : '--glass-opacity-light').trim());
      
      const defaultGlassBorderColor = getComputedStyle(root).getPropertyValue(activeColorScheme === 'dark' ? '--glass-border-color-dark' : '--glass-border-color-light').trim();
      const defaultGlassShadow = getComputedStyle(root).getPropertyValue(activeColorScheme === 'dark' ? '--glass-shadow-dark' : '--glass-shadow-light').trim();
      const defaultGlassTextColor = getComputedStyle(root).getPropertyValue(activeColorScheme === 'dark' ? '--glass-text-color-dark' : '--glass-text-color-light').trim();
      const defaultBlurIntensity = getComputedStyle(root).getPropertyValue(activeColorScheme === 'dark' ? '--glass-blur-intensity-dark' : '--glass-blur-intensity-light').trim();

      // Construct HSLA values for glass panes
      // User-picked colors (hex) will be converted to HSLA with the theme's opacity
      const hexToHsla = (hex: string | undefined, baseHslRaw: string, opacity: number): string => {
        if (!hex) return `hsla(${baseHslRaw}, ${opacity})`; // Fallback to theme default HSL + opacity
        
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
          r = parseInt(hex[1] + hex[1], 16);
          g = parseInt(hex[2] + hex[2], 16);
          b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
          r = parseInt(hex[1] + hex[2], 16);
          g = parseInt(hex[3] + hex[4], 16);
          b = parseInt(hex[5] + hex[6], 16);
        } else {
           return `hsla(${baseHslRaw}, ${opacity})`; // Fallback if hex is invalid
        }
        // Basic RGB to HSL (simplified, full conversion is more complex but this gives a hue)
        // For simplicity, we'll just use the base HSL for hue/saturation and apply user's color via RGB values within HSLA's alpha
        // A better approach would be a full hex to HSL conversion.
        // For now, let's make user picked color fully define the color part.
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      };
      
      const finalGlassColorOne = hexToHsla(glassmorphismOptions?.gradientColor1, glassColorOneRaw, glassOpacity);
      const finalGlassColorTwo = hexToHsla(glassmorphismOptions?.gradientColor2, glassColorTwoRaw, glassOpacity);

      root.style.setProperty('--dynamic-glass-color-one', finalGlassColorOne);
      root.style.setProperty('--dynamic-glass-color-two', finalGlassColorTwo);
      root.style.setProperty('--dynamic-glass-blur', `${glassmorphismOptions?.blurIntensity || parseFloat(defaultBlurIntensity.replace('px',''))}px`);
      
      root.style.setProperty('--dynamic-glass-border-color', defaultGlassBorderColor);
      root.style.setProperty('--dynamic-glass-shadow', defaultGlassShadow);
      root.style.setProperty('--dynamic-glass-text-color', defaultGlassTextColor);
      // Set body text color for glassmorphism (general text on page background)
      body.style.color = getComputedStyle(root).getPropertyValue('--foreground').trim();


      if (glassmorphismOptions?.animatedGradient) {
        root.classList.add('animate-gradient');
      }
    } else {
      // Default theme style
      // Clear dynamic glass properties
      root.style.removeProperty('--dynamic-glass-color-one');
      root.style.removeProperty('--dynamic-glass-color-two');
      root.style.removeProperty('--dynamic-glass-blur');
      root.style.removeProperty('--dynamic-glass-border-color');
      root.style.removeProperty('--dynamic-glass-shadow');
      root.style.removeProperty('--dynamic-glass-text-color');
      // Body background and text color will be set by .light/.dark via globals.css
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
