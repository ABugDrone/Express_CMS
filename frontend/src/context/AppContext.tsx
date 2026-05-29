import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NewsItem, UserProfile, Advertisement, JournalistProfile } from '../types';
import {
  apiLogin, apiLogout, apiGetMe, apiUpdateProfile as apiUpdateProfileCall,
  apiGetArticles, apiCreateArticle, apiUpdateArticle, apiDeleteArticle,
  apiGetAds, apiCreateAd, apiUpdateAd, apiDeleteAd,
  apiGetCategories,
  getToken, clearToken, ApiArticle, ApiAd,
} from '../lib/api';

const JOURNALISTS_KEY   = 'jm_journalist_profiles';
const STAFF_STORAGE_KEY = 'jm_staff_accounts';
const CATEGORY_CACHE_KEY = 'jm_category_cache';
const CATEGORY_CACHE_TTL = 5 * 60 * 1000;

function articleToNewsItem(a: ApiArticle): NewsItem {
  return {
    id:         String(a.id),
    title:      a.title,
    slug:       a.slug,
    excerpt:    a.excerpt,
    content:    a.content,
    category:   a.category,
    author:     a.author,
    date:       new Date(a.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    createdAt:  a.created_at,
    imageUrl:   a.image_url || 'https://picsum.photos/seed/news/800/400',
    videoUrl:   a.video_url || undefined,
    driveUrl:   a.drive_url || undefined,
    isFeatured: Boolean(a.is_featured),
    isBreaking: Boolean(a.is_breaking),
    tags:       Array.isArray(a.tags) ? a.tags : [],
  };
}

function adToAdvertisement(a: ApiAd): Advertisement {
  return {
    id:          String(a.id),
    title:       a.title,
    imageUrl:    a.image_url  || undefined,
    bannerUrl:   a.banner_url || undefined,
    videoUrl:    a.video_url  || undefined,
    videoFile:   a.video_file || undefined,
    redirectUrl: a.redirect_url,
    placement:   a.placement,
    type:        a.type,
    isPaid:      Boolean(a.is_paid),
    startDate:   a.start_date,
    endDate:     a.end_date,
    isActive:    Boolean(a.is_active),
    createdAt:   a.created_at,
    adsenseCode: a.adsense_code || undefined,
  };
}

async function getCategoryId(name: string): Promise<number> {
  try {
    const cached = localStorage.getItem(CATEGORY_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CATEGORY_CACHE_TTL) {
        const match = data.find((c: { name: string }) => c.name.toLowerCase() === name.toLowerCase());
        if (match) return match.id;
      }
    }
  } catch { /* ignore */ }

  try {
    const categories = await apiGetCategories();
    localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify({ data: categories, timestamp: Date.now() }));
    const match = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    return match?.id ?? 1;
  } catch {
    return 1;
  }
}

function invalidateCategoryCache(): void {
  localStorage.removeItem(CATEGORY_CACHE_KEY);
}

interface AppContextType {
  news: NewsItem[];
  newsLoading: boolean;
  addNews: (news: NewsItem) => void;
  updateNews: (id: string, updates: Partial<NewsItem>) => void;
  deleteNews: (id: string) => void;
  refreshNews: () => Promise<void>;
  ads: Advertisement[];
  adsLoading: boolean;
  addAd: (ad: Advertisement) => void;
  updateAd: (id: string, updates: Partial<Advertisement>) => void;
  deleteAd: (id: string) => void;
  getAdsByPlacement: (placement: Advertisement['placement']) => Advertisement[];
  refreshAds: () => Promise<void>;
  user: UserProfile | null;
  isAdmin: boolean;
  isStaff: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<UserProfile, 'name' | 'bio' | 'avatarUrl' | 'twitterUrl' | 'linkedinUrl'>>) => void;
  bannedUserIds: string[];
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  storageSize: number;
  clearOldCache: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BANNED_USERS: 'jm_banned_users',
  THEME: 'jm_theme',
};

const getStorageSize = (): number => {
  let size = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      size += localStorage[key].length + key.length;
    }
  }
  return size;
};

function syncJournalistProfiles(updatedUser: UserProfile) {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    const staffAccounts: Array<{
      id: string; display_name?: string; full_name?: string; staffRole: string;
      bio?: string; avatar_url?: string; twitter_url?: string; linkedin_url?: string; is_active: boolean;
    }> = stored ? JSON.parse(stored) : [];

    const roleLabels: Record<string, string> = {
      editor: 'Editor', reporter: 'Reporter', moderator: 'Moderator',
    };

    const profiles: JournalistProfile[] = [];

    const adminRaw = (() => {
      try { return JSON.parse(localStorage.getItem('jm_admin_profile') ?? 'null'); } catch { return null; }
    })();
    const adminName = updatedUser.role === 'admin' ? updatedUser.name : (adminRaw?.name ?? '');
    const adminBio  = updatedUser.role === 'admin' ? (updatedUser.bio ?? '') : (adminRaw?.bio ?? '');
    if (adminName || adminBio) {
      profiles.push({
        display_name: adminName || 'Admin',
        role_label:   'Editor-in-Chief',
        bio:          adminBio,
        avatar_url:   updatedUser.role === 'admin' ? (updatedUser.avatarUrl ?? '') : (adminRaw?.avatarUrl ?? ''),
        twitter_url:  updatedUser.role === 'admin' ? (updatedUser.twitterUrl ?? '') : (adminRaw?.twitterUrl ?? ''),
        linkedin_url: updatedUser.role === 'admin' ? (updatedUser.linkedinUrl ?? '') : (adminRaw?.linkedinUrl ?? ''),
      });
    }

    for (const s of staffAccounts) {
      if (!s.is_active) continue;
      const isCurrentUser = updatedUser.role === 'staff' && updatedUser.id === s.id;
      const name = isCurrentUser ? updatedUser.name : (s.display_name || s.full_name || '');
      const bio  = isCurrentUser ? (updatedUser.bio ?? '') : (s.bio ?? '');
      if (!name && !bio) continue;
      profiles.push({
        display_name: name || 'Staff',
        role_label:   roleLabels[s.staffRole] ?? 'Staff',
        bio,
        avatar_url:   isCurrentUser ? (updatedUser.avatarUrl ?? '') : (s.avatar_url ?? ''),
        twitter_url:  isCurrentUser ? (updatedUser.twitterUrl ?? '') : (s.twitter_url ?? ''),
        linkedin_url: isCurrentUser ? (updatedUser.linkedinUrl ?? '') : (s.linkedin_url ?? ''),
      });
    }

    localStorage.setItem(JOURNALISTS_KEY, JSON.stringify(profiles));
  } catch { /* ignore */ }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [news, setNews]               = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsPage, setNewsPage] = useState(1);
  const [newsTotalPages, setNewsTotalPages] = useState(1);
  const newsInitialized               = useRef(false);

  const [ads, setAds]                 = useState<Advertisement[]>([]);
  const [adsLoading, setAdsLoading]   = useState(true);
  const adsInitialized                = useRef(false);

  const [user, setUser]           = useState<UserProfile | null>(null);
  const [bannedUserIds, setBannedUserIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.BANNED_USERS) ?? '[]'); } catch { return []; }
  });
  const [theme, setTheme]         = useState<'light' | 'dark'>(() => {
    try { return localStorage.getItem(STORAGE_KEYS.THEME) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
  });
  const [storageSize, setStorageSize] = useState(getStorageSize);

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANNED_USERS, JSON.stringify(bannedUserIds));
  }, [bannedUserIds]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let role: 'admin' | 'staff' = 'admin';
    let staffRole: 'editor' | 'reporter' | 'moderator' | undefined;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        clearToken();
        return;
      }
      role      = payload.role === 'staff' ? 'staff' : 'admin';
      staffRole = payload.staff_role ?? undefined;
    } catch {
      clearToken();
      return;
    }

    apiGetMe()
      .then((profile: any) => {
        setUser({
          id:          profile.id ? String(profile.id) : 'admin_1',
          name:        profile.display_name || (role === 'admin' ? 'Admin' : 'Staff'),
          email:       profile.email || '',
          role,
          staffRole,
          staffRoles:  profile.staffRoles ?? [],
          bio:         profile.bio ?? '',
          avatarUrl:   profile.avatar_url ?? '',
          twitterUrl:  profile.twitter_url ?? '',
          linkedinUrl: profile.linkedin_url ?? '',
        });
      })
      .catch(() => {
        clearToken();
      });
  }, []);

  const refreshNews = useCallback(async () => {
    if (!newsInitialized.current) setNewsLoading(true);
    try {
      const res = await apiGetArticles({ per_page: 20 });
      setNews(res.items.map(articleToNewsItem));
      setNewsPage(1);
      setNewsTotalPages(res.total_pages || 1);
    } catch {
      // Backend unreachable
    } finally {
      setNewsLoading(false);
      newsInitialized.current = true;
    }
  }, []);

  const loadMoreNews = useCallback(async () => {
    const nextPage = newsPage + 1;
    if (nextPage > newsTotalPages) return;
    try {
      const res = await apiGetArticles({ per_page: 20, page: String(nextPage) });
      setNews(prev => [...prev, ...res.items.map(articleToNewsItem)]);
      setNewsPage(nextPage);
    } catch {
      // Silently fail
    }
  }, [newsPage, newsTotalPages]);

  const refreshAds = useCallback(async () => {
    if (!adsInitialized.current) setAdsLoading(true);
    try {
      const items = await apiGetAds();
      setAds(items.map(adToAdvertisement));
    } catch {
      // Backend unreachable
    } finally {
      setAdsLoading(false);
      adsInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    refreshNews();
    refreshAds();
  }, [refreshNews, refreshAds]);

  const addNews = useCallback(async (item: NewsItem) => {
    setNews(prev => [item, ...prev]);
    if (getToken()) {
      try {
        const catId = await getCategoryId(item.category);
        await apiCreateArticle({
          title:        item.title,
          excerpt:      item.excerpt,
          content:      item.content ?? '',
          category_id:  catId,
          author:       item.author,
          image_url:    item.imageUrl,
          video_url:    item.videoUrl ?? '',
          drive_url:    item.driveUrl ?? '',
          tags:         item.tags ?? [],
          is_featured:  item.isFeatured ? 1 : 0,
          is_breaking:  item.isBreaking ? 1 : 0,
          is_published: 1,
        });
        refreshNews();
      } catch { /* keep optimistic */ }
    }
  }, [refreshNews]);

  const updateNews = useCallback(async (id: string, updates: Partial<NewsItem>) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    if (getToken() && !isNaN(Number(id))) {
      try {
        const payload: Record<string, unknown> = {};
        if (updates.title      !== undefined) payload.title       = updates.title;
        if (updates.excerpt    !== undefined) payload.excerpt     = updates.excerpt;
        if (updates.content    !== undefined) payload.content     = updates.content;
        if (updates.imageUrl   !== undefined) payload.image_url   = updates.imageUrl;
        if (updates.videoUrl   !== undefined) payload.video_url   = updates.videoUrl;
        if (updates.driveUrl   !== undefined) payload.drive_url   = updates.driveUrl;
        if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured ? 1 : 0;
        if (updates.isBreaking !== undefined) payload.is_breaking = updates.isBreaking ? 1 : 0;
        if (updates.tags       !== undefined) payload.tags        = updates.tags;
        if (updates.category   !== undefined) {
          payload.category_id = await getCategoryId(updates.category);
          invalidateCategoryCache();
        }
        await apiUpdateArticle(Number(id), payload as Parameters<typeof apiUpdateArticle>[1]);
        refreshNews();
      } catch { /* keep optimistic */ }
    }
  }, [refreshNews]);

  const deleteNews = useCallback(async (id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
    if (getToken() && !isNaN(Number(id))) {
      try {
        await apiDeleteArticle(Number(id));
        refreshNews();
      } catch { /* keep optimistic */ }
    }
  }, [refreshNews]);

  const addAd = useCallback(async (ad: Advertisement) => {
    setAds(prev => [ad, ...prev]);
    if (getToken()) {
      try {
        await apiCreateAd({
          title:        ad.title,
          type:         ad.type,
          placement:    ad.placement,
          image_url:    ad.imageUrl ?? '',
          banner_url:   ad.bannerUrl ?? '',
          video_url:    ad.videoUrl ?? '',
          video_file:   ad.videoFile ?? '',
          redirect_url: ad.redirectUrl,
          adsense_code: ad.adsenseCode ?? '',
          is_paid:      ad.isPaid ? 1 : 0,
          is_active:    ad.isActive ? 1 : 0,
          start_date:   ad.startDate,
          end_date:     ad.endDate,
        });
        refreshAds();
      } catch { /* keep optimistic */ }
    }
  }, [refreshAds]);

  const updateAd = useCallback(async (id: string, updates: Partial<Advertisement>) => {
    setAds(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    if (getToken() && !isNaN(Number(id))) {
      try {
        const payload: Partial<ApiAd> = {};
        if (updates.title       !== undefined) payload.title        = updates.title;
        if (updates.type        !== undefined) payload.type         = updates.type;
        if (updates.placement   !== undefined) payload.placement    = updates.placement;
        if (updates.imageUrl    !== undefined) payload.image_url    = updates.imageUrl;
        if (updates.bannerUrl   !== undefined) payload.banner_url   = updates.bannerUrl;
        if (updates.videoUrl    !== undefined) payload.video_url    = updates.videoUrl;
        if (updates.videoFile   !== undefined) payload.video_file   = updates.videoFile;
        if (updates.redirectUrl !== undefined) payload.redirect_url = updates.redirectUrl;
        if (updates.adsenseCode !== undefined) payload.adsense_code = updates.adsenseCode;
        if (updates.isPaid      !== undefined) payload.is_paid      = updates.isPaid ? 1 : 0;
        if (updates.isActive    !== undefined) payload.is_active    = updates.isActive ? 1 : 0;
        if (updates.startDate   !== undefined) payload.start_date   = updates.startDate;
        if (updates.endDate     !== undefined) payload.end_date     = updates.endDate;
        await apiUpdateAd(Number(id), payload);
        refreshAds();
      } catch { /* keep optimistic */ }
    }
  }, [refreshAds]);

  const deleteAd = useCallback(async (id: string) => {
    setAds(prev => prev.filter(a => a.id !== id));
    if (getToken() && !isNaN(Number(id))) {
      try {
        await apiDeleteAd(Number(id));
        refreshAds();
      } catch { /* keep optimistic */ }
    }
  }, [refreshAds]);

  const getAdsByPlacement = useCallback((placement: Advertisement['placement']): Advertisement[] =>
    ads.filter(ad => ad.placement === placement && ad.isActive), [ads]);

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const data = await apiLogin(password);
      setUser({
        id:         data.role === 'admin' ? 'admin_1' : `staff_${Date.now()}`,
        name:       data.display_name || (data.role === 'admin' ? 'Admin' : 'Staff'),
        email:      '',
        role:       data.role,
        staffRole:  data.staff_role,
        staffRoles: data.staff_roles ?? [],
        bio:        data.bio ?? '',
        avatarUrl:  data.avatar_url ?? '',
        twitterUrl: data.twitter_url ?? '',
        linkedinUrl: data.linkedin_url ?? '',
      });
      refreshNews();
      refreshAds();
      return true;
    } catch {
      return false;
    }
  }, [refreshNews, refreshAds]);

  const updateProfile = useCallback((updates: Partial<Pick<UserProfile, 'name' | 'bio' | 'avatarUrl' | 'twitterUrl' | 'linkedinUrl'>>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      if (getToken()) {
        apiUpdateProfileCall({
          display_name: updated.name,
          bio:          updated.bio,
          avatar_url:   updated.avatarUrl,
          twitter_url:  updated.twitterUrl,
          linkedin_url: updated.linkedinUrl,
        }).catch(() => {});
      }
      if (prev.role === 'admin') {
        localStorage.setItem('jm_admin_profile', JSON.stringify({
          name: updated.name, bio: updated.bio,
          avatarUrl: updated.avatarUrl, twitterUrl: updated.twitterUrl, linkedinUrl: updated.linkedinUrl,
        }));
      } else {
        try {
          const stored = localStorage.getItem(STAFF_STORAGE_KEY);
          if (stored) {
            const accounts = JSON.parse(stored);
            const idx = accounts.findIndex((a: { id: string }) => a.id === prev.id);
            if (idx !== -1) {
              accounts[idx] = { ...accounts[idx], display_name: updated.name, bio: updated.bio,
                avatar_url: updated.avatarUrl, twitter_url: updated.twitterUrl, linkedin_url: updated.linkedinUrl };
              localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(accounts));
            }
          }
        } catch { /* ignore */ }
      }
      syncJournalistProfiles(updated);
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    apiLogout().catch(() => {});
    setUser(null);
  }, []);

  const banUser = useCallback((userId: string) => setBannedUserIds(prev => prev.includes(userId) ? prev : [...prev, userId]), []);
  const unbanUser = useCallback((userId: string) => setBannedUserIds(prev => prev.filter(id => id !== userId)), []);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'light' ? 'dark' : 'light'), []);
  const clearOldCache = useCallback(() => {
    const keysToRemove = ['jm_news_cache', 'jm_ads_cache', CATEGORY_CACHE_KEY];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    setStorageSize(getStorageSize());
  }, []);

  const hasMoreNews = newsPage < newsTotalPages;

  const contextValue = useMemo(() => ({
    news, newsLoading, addNews, updateNews, deleteNews, refreshNews, loadMoreNews, hasMoreNews,
    ads, adsLoading, addAd, updateAd, deleteAd, getAdsByPlacement, refreshAds,
    user, isAdmin, isStaff, login, logout, updateProfile,
    bannedUserIds, banUser, unbanUser,
    theme, toggleTheme,
    storageSize, clearOldCache,
  }), [news, newsLoading, addNews, updateNews, deleteNews, refreshNews, loadMoreNews, hasMoreNews,
      ads, adsLoading, addAd, updateAd, deleteAd, getAdsByPlacement, refreshAds,
      user, isAdmin, isStaff, login, logout, updateProfile,
      bannedUserIds, banUser, unbanUser,
      theme, toggleTheme, storageSize, clearOldCache]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
