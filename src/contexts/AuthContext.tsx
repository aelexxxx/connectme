
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

export interface GlassmorphismOptions {
  gradientColor1?: string;
  gradientColor2?: string;
  animatedGradient?: boolean;
  blurIntensity?: number; // e.g., 5-20
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  themeStyle: 'default' | 'glassmorphism';
  layoutMode: 'stacked' | 'horizontal'; // Added layoutMode
  glassmorphismOptions?: GlassmorphismOptions;
  notifications: {
    newConnectionEmail: boolean;
    activityUpdateEmail: boolean;
    inAppNotifications: boolean;
  };
  privacy: {
    allowProfileSuggestions: boolean;
    profileDiscoverable: boolean; // e.g. by search engines, public listing
  };
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
  settings?: UserSettings;
}

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  login: (email: string, name?:string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
  enterGuestMode: () => void;
  updateProfile: (updatedData: Partial<Omit<User, 'id' | 'email'>>) => void;
  updateUserSettings: (updatedSettings: Partial<UserSettings>) => void;
  deleteAccount: () => void;
  addBlogPost: (post: { title: string; content: string }) => void;
  updateBlogPost: (postId: string, updatedPost: Partial<Omit<BlogPost, 'id' | 'date'>>) => void;
  deleteBlogPost: (postId: string) => void;
  addSocialLink: (link: Omit<SocialLink, 'id'>) => void;
  updateSocialLink: (linkId: string, updatedLink: Partial<Omit<SocialLink, 'id'>>) => void;
  deleteSocialLink: (linkId: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'system',
  themeStyle: 'default',
  layoutMode: 'stacked', // Default layout mode
  glassmorphismOptions: {
    gradientColor1: undefined, 
    gradientColor2: undefined, 
    animatedGradient: false,
    blurIntensity: 12, 
  },
  notifications: {
    newConnectionEmail: true,
    activityUpdateEmail: true,
    inAppNotifications: true,
  },
  privacy: {
    allowProfileSuggestions: true,
    profileDiscoverable: true,
  },
};

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
  settings: { ...DEFAULT_USER_SETTINGS },
};

const PROXY_USER_SETTINGS: UserSettings = {
  ...DEFAULT_USER_SETTINGS,
  theme: 'dark',
  themeStyle: 'glassmorphism',
  layoutMode: 'stacked', // Can be 'horizontal' if desired for proxy default
  glassmorphismOptions: {
    ...DEFAULT_USER_SETTINGS.glassmorphismOptions,
    animatedGradient: true,
    gradientColor1: '#4a00e0', 
    gradientColor2: '#8e2de2', 
    blurIntensity: 10,
  },
};

const PROXY_USER_DATA: User = {
  id: 'proxy@example.com',
  email: 'proxy@example.com',
  name: 'Proxy User',
  photoUrl: `https://picsum.photos/seed/proxy_user_connectme/200/200`,
  bio: 'This is the default proxy user. Explore all features of ConnectMe! This profile demonstrates various functionalities like social links, blog posts, and customizable settings.',
  status: 'Demonstrating ConnectMe 🚀',
  socialLinks: [
    { id: 'sl_proxy_github', platform: 'github', url: 'https://github.com/connectme-proxy' },
    { id: 'sl_proxy_linkedin', platform: 'linkedin', url: 'https://linkedin.com/in/connectme-proxy' },
    { id: 'sl_proxy_website', platform: 'website', url: 'https://proxy.connectme.example' },
  ],
  blogPosts: [
    { id: 'bp_proxy_1', title: 'Exploring ConnectMe as Proxy', content: 'Welcome! This profile is set up to demonstrate the ConnectMe application features. Feel free to navigate around and see how things work.', date: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 'bp_proxy_2', title: 'Feature Showcase: Glassmorphism', content: 'The current theme is set to glassmorphism with an animated gradient. You can change this in the settings!', date: new Date(Date.now() - 3600000 * 5).toISOString() },
  ],
  settings: PROXY_USER_SETTINGS,
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
      const parsedUser = JSON.parse(storedUser);
      // Ensure settings are fully populated with defaults if some are missing
      parsedUser.settings = { 
        ...DEFAULT_USER_SETTINGS, 
        ...(parsedUser.settings || {}),
        glassmorphismOptions: {
          ...DEFAULT_USER_SETTINGS.glassmorphismOptions,
          ...(parsedUser.settings?.glassmorphismOptions || {})
        },
        notifications: {
          ...DEFAULT_USER_SETTINGS.notifications,
          ...(parsedUser.settings?.notifications || {})
        },
        privacy: {
          ...DEFAULT_USER_SETTINGS.privacy,
          ...(parsedUser.settings?.privacy || {})
        }
      };
      setUser(parsedUser);
    } else if (storedGuest === 'true') {
      setIsGuest(true);
    } else {
      // Default to Proxy User if no stored user and not explicitly guest
      setUser(PROXY_USER_DATA);
      setIsGuest(false);
      updateUserStorage(PROXY_USER_DATA); // Persist proxy user for session consistency
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
  
  const login = (email: string, name?:string) => {
    const baseName = name || email.split('@')[0];
    const newUser: User = { 
      ...MOCK_USER_BASE, 
      id: email, 
      email, 
      name: baseName,
      photoUrl: MOCK_USER_BASE.photoUrl?.replace('profile', baseName.toLowerCase().replace(/\s+/g, '_')) || `https://picsum.photos/seed/${baseName.toLowerCase().replace(/\s+/g, '_')}/200/200`,
      settings: { ...DEFAULT_USER_SETTINGS } 
    };
    setUser(newUser);
    setIsGuest(false);
    updateUserStorage(newUser);
    localStorage.removeItem('connectme-guest');
    router.push('/dashboard');
  };

  const signup = (name: string, email: string) => {
    const newUser: User = { 
      ...MOCK_USER_BASE, 
      id: email, 
      email, 
      name,
      photoUrl: MOCK_USER_BASE.photoUrl?.replace('profile', name.toLowerCase().replace(/\s+/g, '_')) || `https://picsum.photos/seed/${name.toLowerCase().replace(/\s+/g, '_')}/200/200`,
      settings: { ...DEFAULT_USER_SETTINGS } 
    };
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

  const deleteAccount = () => {
    logout(); 
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
      const { settings, ...otherData } = updatedData;
      let newSettings = user.settings;
      if (settings) {
        newSettings = { ...(user.settings || DEFAULT_USER_SETTINGS), ...settings };
      }
      
      const newUser = { ...user, ...otherData, settings: newSettings };
      setUser(newUser);
      updateUserStorage(newUser);
    }
  };

  const updateUserSettings = (updatedSettings: Partial<UserSettings>) => {
    if (user) {
      const currentSettings = user.settings || DEFAULT_USER_SETTINGS;
      const newSettings = {
        ...currentSettings, 
        ...updatedSettings, 
        notifications: { 
          ...currentSettings.notifications,
          ...updatedSettings.notifications,
        },
        privacy: {
          ...currentSettings.privacy,
          ...updatedSettings.privacy,
        },
        glassmorphismOptions: {
          ...currentSettings.glassmorphismOptions,
          ...updatedSettings.glassmorphismOptions,
        }
      };
      updateProfile({ settings: newSettings });
    } else if (isGuest) {
      console.warn("Attempted to update settings in guest mode. Guest settings are not persisted.");
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
        p.id === postId ? { ...p, ...updatedFields, date: p.date } : p
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
    const guestForbiddenPaths = ['/settings'];

    const isPublicPath = publicPaths.some(publicPath => pathname === publicPath || (publicPath !== '/' && pathname.startsWith(publicPath + '/')));
    const isGuestForbiddenPath = guestForbiddenPaths.some(path => pathname === path);

    if (isGuest && isGuestForbiddenPath) {
      router.push('/dashboard'); 
      return;
    }
    
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
        user, isGuest, login, signup, logout, enterGuestMode, deleteAccount,
        updateProfile, updateUserSettings,
        addBlogPost, updateBlogPost, deleteBlogPost,
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

export const useAuthSettings = () => {
  const context = useAuth();
  let baseSettings = DEFAULT_USER_SETTINGS;
  if (context.user) {
    baseSettings = context.user.settings || DEFAULT_USER_SETTINGS;
  } else if (context.isGuest) {
    baseSettings = DEFAULT_USER_SETTINGS;
  }
  
  const fullyPopulatedSettings: UserSettings = {
    ...DEFAULT_USER_SETTINGS,
    ...baseSettings,
    glassmorphismOptions: { 
      ...DEFAULT_USER_SETTINGS.glassmorphismOptions,
      ...(baseSettings.glassmorphismOptions || {}), 
    },
    notifications: { 
      ...DEFAULT_USER_SETTINGS.notifications,
      ...(baseSettings.notifications || {}),
    },
    privacy: { 
      ...DEFAULT_USER_SETTINGS.privacy,
      ...(baseSettings.privacy || {}),
    },
  };
  
  return { 
    settings: fullyPopulatedSettings,
    updateUserSettings: context.updateUserSettings,
    isGuest: context.isGuest,
    user: context.user,
    deleteAccount: context.deleteAccount,
    loading: context.loading,
  };
};

