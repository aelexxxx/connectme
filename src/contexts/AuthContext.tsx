
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  bio?: string;
  status?: string;
  socialLinks?: SocialLink[];
  blogPosts?: BlogPost[];
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  login: (email: string, name?:string) => void; // Simplified login
  signup: (name: string, email: string) => void; // Simplified signup
  logout: () => void;
  enterGuestMode: () => void;
  updateProfile: (updatedData: Partial<Omit<User, 'id' | 'email'>>) => void;
  addBlogPost: (post: { title: string; content: string }) => void;
  updateBlogPost: (postId: string, updatedPost: Partial<Omit<BlogPost, 'id' | 'date'>>) => void;
  deleteBlogPost: (postId: string) => void;
  addSocialLink: (link: Omit<SocialLink, 'id'>) => void;
  updateSocialLink: (linkId: string, updatedLink: Partial<Omit<SocialLink, 'id'>>) => void;
  deleteSocialLink: (linkId: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER_BASE: Omit<User, 'id' | 'email' | 'name'> = {
  photoUrl: 'https://picsum.photos/seed/profile/200/200',
  bio: 'Passionate about connecting with new people and sharing ideas. Always learning and growing!',
  status: 'Exploring new opportunities 🌟',
  socialLinks: [
    { id: 'sl1', platform: 'twitter', url: 'https://twitter.com/connectmeuser' },
    { id: 'sl2', platform: 'linkedin', url: 'https://linkedin.com/in/connectmeuser' },
  ],
  blogPosts: [
    { id: 'bp1', title: 'Welcome to My ConnectMe Profile!', content: 'This is my first post, excited to share more soon.', date: new Date(Date.now() - 86400000 * 3).toISOString() },
  ],
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('connectme-user');
    const storedGuest = localStorage.getItem('connectme-guest');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (storedGuest === 'true') {
      setIsGuest(true);
    }
    setLoading(false);
  }, []);

  const updateUserStorage = (updatedUser: User | null) => {
    if (updatedUser) {
      localStorage.setItem('connectme-user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('connectme-user');
    }
  };
  
  const login = (email: string, name: string = "Demo User") => {
    const newUser: User = { ...MOCK_USER_BASE, id: email, email, name: name || email.split('@')[0] };
    setUser(newUser);
    setIsGuest(false);
    updateUserStorage(newUser);
    localStorage.removeItem('connectme-guest');
    router.push('/dashboard');
  };

  const signup = (name: string, email: string) => {
    const newUser: User = { ...MOCK_USER_BASE, id: email, email, name };
    setUser(newUser);
    setIsGuest(false);
    updateUserStorage(newUser);
    localStorage.removeItem('connectme-guest');
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    updateUserStorage(null);
    localStorage.removeItem('connectme-guest');
    router.push('/login');
  };

  const enterGuestMode = () => {
    setUser(null);
    setIsGuest(true);
    updateUserStorage(null);
    localStorage.setItem('connectme-guest', 'true');
    router.push('/dashboard');
  };

  const updateProfile = (updatedData: Partial<Omit<User, 'id' | 'email'>>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      updateUserStorage(newUser);
    }
  };

  const addBlogPost = (post: { title: string; content: string }) => {
    if (user) {
      const newPost: BlogPost = { ...post, id: `bp${Date.now()}`, date: new Date().toISOString() };
      const updatedPosts = [...(user.blogPosts || []), newPost];
      updateProfile({ blogPosts: updatedPosts });
    }
  };
  
  const updateBlogPost = (postId: string, updatedFields: Partial<Omit<BlogPost, 'id' | 'date'>>) => {
    if (user && user.blogPosts) {
      const updatedPosts = user.blogPosts.map(p => 
        p.id === postId ? { ...p, ...updatedFields, date: p.date } : p // Keep original date unless explicitly changed
      );
      updateProfile({ blogPosts: updatedPosts });
    }
  };

  const deleteBlogPost = (postId: string) => {
    if (user && user.blogPosts) {
      const updatedPosts = user.blogPosts.filter(p => p.id !== postId);
      updateProfile({ blogPosts: updatedPosts });
    }
  };

  const addSocialLink = (link: Omit<SocialLink, 'id'>) => {
    if (user) {
      const newLink: SocialLink = { ...link, id: `sl${Date.now()}` };
      const updatedLinks = [...(user.socialLinks || []), newLink];
      updateProfile({ socialLinks: updatedLinks });
    }
  };

  const updateSocialLink = (linkId: string, updatedFields: Partial<Omit<SocialLink, 'id'>>) => {
     if (user && user.socialLinks) {
      const updatedLinks = user.socialLinks.map(l => 
        l.id === linkId ? { ...l, ...updatedFields } : l
      );
      updateProfile({ socialLinks: updatedLinks });
    }
  };

  const deleteSocialLink = (linkId: string) => {
    if (user && user.socialLinks) {
      const updatedLinks = user.socialLinks.filter(l => l.id !== linkId);
      updateProfile({ socialLinks: updatedLinks });
    }
  };


  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/', '/login', '/signup'];
    const isPublicPath = publicPaths.some(publicPath => pathname === publicPath || (publicPath !== '/' && pathname.startsWith(publicPath + '/')));
    
    const isAuthenticatedRoute = !isPublicPath;
    const isLoggedIn = !!user || isGuest;

    if (isAuthenticatedRoute && !isLoggedIn) {
      router.push('/login');
    } else if ((user || isGuest) && (pathname === '/login' || pathname === '/signup')) {
       router.push('/dashboard');
    }
  }, [user, isGuest, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ 
        user, isGuest, login, signup, logout, enterGuestMode, 
        updateProfile, addBlogPost, updateBlogPost, deleteBlogPost,
        addSocialLink, updateSocialLink, deleteSocialLink,
        loading 
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
