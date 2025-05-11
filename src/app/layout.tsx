
"use client"; // Required for AuthContext and useEffect
import type { ReactNode } from 'react'; // Import ReactNode
import { useEffect } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
// Metadata needs to be exported from a server component or page, not here directly in a client component layout.
// For now, we will keep it simple. If Metadata is strictly needed here, this file structure needs rethinking.
// export const metadata: Metadata = {
//   title: 'ConnectMe',
//   description: 'Connect, Share, Grow your Network.',
// };

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
    const currentTheme = user?.settings?.theme || 'system';

    root.classList.remove('light', 'dark');

    if (currentTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(currentTheme);
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
    <html lang="en" suppressHydrationWarning> {/* suppressHydrationWarning for theme changes */}
      <head>
        {/* Basic metadata can be placed here if not using Next.js Metadata API in a server component */}
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
