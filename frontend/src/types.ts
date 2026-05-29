export interface NewsItem {
  id: string;
  title: string;
  slug?: string;
  excerpt: string;
  content?: string;
  category: string;           // primary category (first selected)
  categories?: string[];      // all selected categories
  author: string;
  date: string;
  createdAt?: string;         // raw ISO date for URL construction
  imageUrl: string;
  videoUrl?: string;
  driveUrl?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  tags?: string[];
}

export interface Advertisement {
  id: string;
  title: string;
  imageUrl?: string; // For static image ads
  bannerUrl?: string; // For animated GIF/banner ads
  videoUrl?: string; // For YouTube/Vimeo embed URLs
  videoFile?: string; // For uploaded video files
  redirectUrl: string;
  placement: 'top' | 'left' | 'right' | 'middle'; // Ad placement location
  type: 'static_image' | 'animated_banner' | 'video' | 'adsense'; // Ad type
  isPaid: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  adsenseCode?: string; // For AdSense integration
}

export type Category = 'News' | 'Politics' | 'Opinion' | 'Business' | 'Health' | 
'Agri & Environ' | 'Education' | 'Entertainment' | 'Technology' | 'Sports' | 'Life';

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  authorId?: string;
  authorEmail?: string;
  authorAvatar?: string;
  isAnonymous?: boolean;
  content: string;
  date: string;
  votes: number;
  replies?: Comment[];
  isSpam?: boolean;
  isFeatured?: boolean; // Featured by admin
}

export interface UserProfile {
  id: string;
  name: string;         // display_name — shown on bylines
  email: string;
  role: 'user' | 'admin' | 'staff';
  staffRole?: 'editor' | 'reporter' | 'moderator';
  staffRoles?: string[];
  bio?: string;
  avatarUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  isBanned?: boolean;
}

export interface StaffUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  role: 'editor' | 'reporter' | 'moderator';
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

/** Public journalist profile shown on the Our Team page */
export interface JournalistProfile {
  display_name: string;
  role_label: string;
  bio: string;
  avatar_url: string;
  twitter_url: string;
  linkedin_url: string;
}
