/**
 * api.ts — centralised HTTP client for the JM News Express backend.
 *
 * Auth token is stored in localStorage so it persists across page refreshes.
 * It is cleared on explicit logout.
 */

const BASE = '/api';
const TOKEN_KEY = 'jm_auth_token';

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = { error: `HTTP ${res.status}` };
  }

  if (!res.ok) {
    const msg = (data as { error?: string })?.error ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string;
  role: 'admin' | 'staff';
  staff_role?: 'editor' | 'reporter' | 'moderator';
  display_name: string;
  bio: string;
  avatar_url: string;
  twitter_url: string;
  linkedin_url: string;
  expires: number;
}

export async function apiLogin(password: string): Promise<LoginResponse> {
  const data = await request<LoginResponse>('/auth?action=login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  setToken(data.token);
  return data;
}

export async function apiLogout(): Promise<void> {
  try {
    await request('/auth?action=logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

export async function apiGetMe() {
  return request('/auth?action=me');
}

export async function apiUpdateProfile(updates: {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
}) {
  return request('/auth?action=profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function apiGetJournalists() {
  return request<Array<{
    display_name: string; role_label: string; bio: string;
    avatar_url: string; twitter_url: string; linkedin_url: string;
  }>>('/auth?action=journalists');
}

// ── Site Config ────────────────────────────────────────────────────────────────

export interface SiteConfig {
  site_name: string;
  site_description: string;
  logo_url: string;
  favicon_url: string;
  footer_copyright: string;
  active_ui_key: string;
  theme: { id: number; name: string; slug: string; config: any } | null;
  socials: { platform: string; url: string; icon: string }[];
  categories: { id: number; name: string; slug: string }[];
}

export async function apiGetConfig() {
  return request<SiteConfig>('/config');
}

// ── Articles ──────────────────────────────────────────────────────────────────

export interface ApiArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image_url: string;
  video_url: string;
  drive_url: string;
  tags: string[];
  is_featured: number;
  is_breaking: number;
  is_published: number;
  views: number;
  created_at: string;
}

export async function apiGetArticles(params: Record<string, string | number> = {}) {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return request<{ items: ApiArticle[]; total: number; page: number; total_pages: number }>(
    `/articles${qs ? '?' + qs : ''}`
  );
}

export async function apiGetArticle(id: number) {
  return request<ApiArticle & { comments: unknown[] }>(`/articles?id=${id}`);
}

export async function apiGetArticleBySlug(slug: string) {
  return request<ApiArticle & { comments: unknown[] }>(`/articles?slug=${encodeURIComponent(slug)}`);
}

export async function apiCreateArticle(data: Partial<ApiArticle> & { category_id?: number }) {
  return request<{ id: number; slug: string }>('/articles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateArticle(id: number, data: Partial<ApiArticle>) {
  return request(`/articles?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteArticle(id: number) {
  return request(`/articles?id=${id}`, { method: 'DELETE' });
}

export async function apiTrackArticleView(id: number) {
  return request<{ views: number }>(`/stats/article/${id}/views`, { method: 'POST' });
}

// ── Advertisements ───────────────────────────────────────────────────────────

export interface ApiAd {
  id: number;
  title: string;
  type: 'static_image' | 'animated_banner' | 'video' | 'adsense';
  placement: 'top' | 'left' | 'right' | 'middle';
  image_url: string;
  banner_url: string;
  video_url: string;
  video_file: string;
  redirect_url: string;
  adsense_code: string;
  is_paid: number;
  is_active: number;
  start_date: string;
  end_date: string;
  impressions: number;
  clicks: number;
  created_at: string;
}

export async function apiGetAds(placement?: string) {
  const qs = placement ? `?placement=${placement}` : '';
  return request<ApiAd[]>(`/ads${qs}`);
}

export async function apiCreateAd(data: Partial<ApiAd>) {
  return request<{ id: number }>('/ads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateAd(id: number, data: Partial<ApiAd>) {
  return request(`/ads?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteAd(id: number) {
  return request(`/ads?id=${id}`, { method: 'DELETE' });
}

export async function apiTrackAdClick(id: number) {
  return request(`/ads?id=${id}&action=click`, { method: 'POST' });
}

// ── Comments ──────────────────────────────────────────────────────────────────

export async function apiGetComments(articleId: number, page = 1, limit = 20) {
  return request<{ items: unknown[]; total: number; page: number; total_pages: number }>(
    `/comments?article_id=${articleId}&page=${page}&limit=${limit}`
  );
}

export async function apiPostComment(data: {
  article_id: number; author_name: string; author_email: string;
  author_avatar?: string; author_id?: string;
  is_anonymous?: boolean; content: string; parent_id?: number;
}) {
  return request('/comments', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiUpdateComment(id: number, data: { is_spam?: number; is_featured?: number }) {
  return request(`/comments?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteComment(id: number) {
  return request(`/comments?id=${id}`, { method: 'DELETE' });
}

export async function apiVoteComment(id: number, direction: 'up' | 'down') {
  return request(`/comments?id=${id}&action=vote`, {
    method: 'POST',
    body: JSON.stringify({ direction }),
  });
}

// ── Staff ────────────────────────────────────────────────────────────────────

export interface ApiStaff {
  id: number;
  username: string;
  email: string;
  full_name: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  twitter_url: string;
  linkedin_url: string;
  role: 'editor' | 'reporter' | 'moderator';
  is_active: number;
  last_login: string;
  created_at: string;
}

export async function apiGetStaff() {
  return request<ApiStaff[]>('/staff');
}

export async function apiCreateStaff(data: {
  username: string; email: string; password: string;
  full_name?: string; role: string;
}) {
  return request<{ id: number }>('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateStaff(id: number, data: Partial<ApiStaff> & { password?: string }) {
  return request(`/staff?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteStaff(id: number) {
  return request(`/staff?id=${id}`, { method: 'DELETE' });
}

// ─ Dashboard ─────────────────────────────────────────────────────────────────

export async function apiGetDashboard() {
  return request<{
    stats: {
      articles: number; drafts: number; comments: number; spam_comments: number;
      ads_active: number; ads_total: number; banned_users: number;
      total_views: number; total_ad_clicks: number;
    };
    recent_articles: unknown[];
    recent_comments: unknown[];
    top_articles: unknown[];
    by_category: { name: string; count: number }[];
  }>('/dashboard');
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function apiGetCategories() {
  return request<{ id: number; name: string; slug: string }[]>('/categories');
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function apiGetSettings() {
  return request<Record<string, string>>('/settings');
}

export async function apiUpdateSettings(data: Record<string, string>) {
  return request('/settings', { method: 'PUT', body: JSON.stringify(data) });
}

// ── Banned users ──────────────────────────────────────────────────────────────

export async function apiGetBanned() {
  return request<{ id: number; user_id: string; reason: string; banned_at: string }[]>('/banned');
}

export async function apiBanUser(userId: string, reason?: string) {
  return request('/banned', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, reason: reason ?? '' }),
  });
}

export async function apiUnbanUser(userId: string) {
  return request(`/banned?user_id=${encodeURIComponent(userId)}`, { method: 'DELETE' });
}

// ── File Upload ───────────────────────────────────────────────────────────────

export type UploadContext = 'profile' | 'news_image' | 'news_video' | 'ad_image' | 'ad_video' | 'comment_avatar';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mime: string;
  context: UploadContext;
}

export async function apiUploadFile(
  file: File,
  context: UploadContext,
  onProgress?: (pct: number) => void
): Promise<UploadResponse> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/upload?context=${context}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data as UploadResponse);
        } else {
          reject(new Error(data?.error ?? `Upload failed (${xhr.status})`));
        }
      } catch {
        reject(new Error('Invalid server response'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

// ── RSS Wire ─────────────────────────────────────────────────────────────────

export interface RssItem {
  title: string;
  url: string;
  excerpt: string;
  image: string;
  published: string;
  source: string;
  source_color: string;
}

export async function apiGetRssFeed(
  source: 'punch' | 'dailytrust' | 'all' = 'all',
  limit = 8
): Promise<RssItem[]> {
  const data = await request<{ items: RssItem[] }>(
    `/rss?source=${source}&limit=${limit}`
  );
  return data.items;
}

// ── CMS: News Types ──────────────────────────────────────────────────────────

export interface ApiNewsType {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: number;
  is_standalone: number;
  article_count: number;
  created_at: string;
}

export async function apiGetNewsTypes() {
  return request<ApiNewsType[]>('/news-types');
}

export async function apiGetActiveNewsTypes() {
  return request<ApiNewsType[]>('/news-types/active');
}

export async function apiCreateNewsType(data: { name: string; description?: string; icon?: string; sort_order?: number; is_active?: number; is_standalone?: number }) {
  return request<{ id: number; slug: string }>('/news-types', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiUpdateNewsType(id: number, data: Partial<ApiNewsType>) {
  return request(`/news-types?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiDeleteNewsType(id: number) {
  return request(`/news-types?id=${id}`, { method: 'DELETE' });
}

// ── CMS: Site Settings ───────────────────────────────────────────────────────

export async function apiGetSiteSettings() {
  return request<Record<string, { value: string; type: string; description: string }>>('/site-settings');
}

export async function apiGetAllSiteSettings() {
  return request<Array<{ id: number; key: string; value: string; type: string; description: string; updated_at: string }>>('/site-settings/all');
}

export async function apiUpdateSiteSettings(data: Record<string, { value: string; type?: string; description?: string }>) {
  return request('/site-settings', { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiCreateSiteSetting(data: { key: string; value: string; type?: string; description?: string }) {
  return request('/site-settings', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiDeleteSiteSetting(key: string) {
  return request(`/site-settings?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
}

// ── CMS: Social Links ────────────────────────────────────────────────────────

export interface ApiSocialLink {
  id: number;
  platform: string;
  icon: string;
  url: string;
  label: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export async function apiGetSocials() {
  return request<ApiSocialLink[]>('/socials');
}

export async function apiGetAllSocials() {
  return request<ApiSocialLink[]>('/socials/all');
}

export async function apiCreateSocial(data: { platform: string; icon?: string; url: string; label?: string; sort_order?: number; is_active?: number }) {
  return request<{ id: number }>('/socials', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiUpdateSocial(id: number, data: Partial<ApiSocialLink>) {
  return request(`/socials?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiDeleteSocial(id: number) {
  return request(`/socials?id=${id}`, { method: 'DELETE' });
}

// ── CMS: Quick Links ─────────────────────────────────────────────────────────

export interface ApiQuickLink {
  id: number;
  label: string;
  url: string;
  group: string;
  icon: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export async function apiGetQuickLinks(group?: string) {
  const qs = group ? `?group=${group}` : '';
  return request<ApiQuickLink[]>(`/quick-links${qs}`);
}

export async function apiGetAllQuickLinks() {
  return request<ApiQuickLink[]>('/quick-links/all');
}

export async function apiCreateQuickLink(data: { label: string; url: string; group?: string; icon?: string; sort_order?: number; is_active?: number }) {
  return request<{ id: number }>('/quick-links', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiUpdateQuickLink(id: number, data: Partial<ApiQuickLink>) {
  return request(`/quick-links?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiDeleteQuickLink(id: number) {
  return request(`/quick-links?id=${id}`, { method: 'DELETE' });
}

// ── CMS: Legal Pages ─────────────────────────────────────────────────────────

export interface ApiLegalPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export async function apiGetLegalPages() {
  return request<ApiLegalPage[]>('/legal-pages');
}

export async function apiGetAllLegalPages() {
  return request<ApiLegalPage[]>('/legal-pages/all');
}

export async function apiGetLegalPage(slug: string) {
  return request<ApiLegalPage>(`/legal-pages/${slug}`);
}

export async function apiCreateLegalPage(data: { title: string; content: string; sort_order?: number; is_active?: number }) {
  return request<{ id: number; slug: string }>('/legal-pages', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiUpdateLegalPage(id: number, data: Partial<ApiLegalPage>) {
  return request(`/legal-pages?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiDeleteLegalPage(id: number) {
  return request(`/legal-pages?id=${id}`, { method: 'DELETE' });
}

// ── CMS: Contact Info ────────────────────────────────────────────────────────

export interface ApiContactInfo {
  id: number;
  type: string;
  label: string;
  value: string;
  icon: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export async function apiGetContactInfo() {
  return request<ApiContactInfo[]>('/contact-info');
}

export async function apiGetAllContactInfo() {
  return request<ApiContactInfo[]>('/contact-info/all');
}

export async function apiCreateContactInfo(data: { type: string; label: string; value: string; icon?: string; sort_order?: number; is_active?: number }) {
  return request<{ id: number }>('/contact-info', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiUpdateContactInfo(id: number, data: Partial<ApiContactInfo>) {
  return request(`/contact-info?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiDeleteContactInfo(id: number) {
  return request(`/contact-info?id=${id}`, { method: 'DELETE' });
}

// ── CMS: CTA Elements ────────────────────────────────────────────────────────

export interface ApiCTAElement {
  id: number;
  label: string;
  text: string;
  link: string;
  placement: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export async function apiGetCTAElements(placement?: string) {
  const qs = placement ? `?placement=${placement}` : '';
  return request<ApiCTAElement[]>(`/cta-elements${qs}`);
}

export async function apiGetAllCTAElements() {
  return request<ApiCTAElement[]>('/cta-elements/all');
}

export async function apiCreateCTAElement(data: { label: string; text?: string; link?: string; placement?: string; sort_order?: number; is_active?: number }) {
  return request<{ id: number }>('/cta-elements', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiUpdateCTAElement(id: number, data: Partial<ApiCTAElement>) {
  return request(`/cta-elements?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiDeleteCTAElement(id: number) {
  return request(`/cta-elements?id=${id}`, { method: 'DELETE' });
}

// ── CMS: Page Elements ───────────────────────────────────────────────────────

export interface ApiPageElement {
  id: number;
  key: string;
  type: string;
  placement: string;
  content: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export async function apiGetPageElements(placement?: string) {
  const qs = placement ? `?placement=${placement}` : '';
  return request<ApiPageElement[]>(`/page-elements${qs}`);
}

export async function apiGetAllPageElements() {
  return request<ApiPageElement[]>('/page-elements/all');
}

export async function apiCreatePageElement(data: { key: string; type: string; placement: string; content: string; sort_order?: number; is_active?: number }) {
  return request<{ id: number }>('/page-elements', { method: 'POST', body: JSON.stringify(data) });
}

export async function apiUpdatePageElement(id: number, data: Partial<ApiPageElement>) {
  return request(`/page-elements?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function apiDeletePageElement(id: number) {
  return request(`/page-elements?id=${id}`, { method: 'DELETE' });
}
