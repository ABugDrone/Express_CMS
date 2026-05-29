import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ConsentModal from './components/modals/ConsentModal';
import AdBanner from './components/ads/AdBanner';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './context/AppContext';
import { ThemeProvider } from './themes/ThemeProvider';
import { getDefaultTheme } from './themes/presets';
import ThemeLoader from './themes/ThemeLoader';
import { useEffect, useRef, useState, lazy, Suspense, useCallback } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { useWebSocket } from './lib/useWebSocket';
import BreakingNewsBanner from './components/news/BreakingNewsBanner';

const HomePage = lazy(() => import('./pages/HomePage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const OurTeamPage = lazy(() => import('./pages/OurTeamPage'));
const AdvertisePage = lazy(() => import('./pages/AdvertisePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const ThemeManager = lazy(() => import('./pages/admin/ThemeManager'));
const ThemeCustomizer = lazy(() => import('./pages/admin/ThemeCustomizer'));
const ThemeImport = lazy(() => import('./pages/admin/ThemeImport'));

function LoadingFallback() {
  return (
    <div className="bg-white dark:bg-[#0a0a0a] min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppContent() {
  const { pathname } = useLocation();
  const { getAdsByPlacement } = useAppContext();
  const topAds = getAdsByPlacement('top');
  const adRef = useRef<HTMLDivElement>(null);
  const [breakingArticle, setBreakingArticle] = useState<{ id: number; title: string; slug: string; excerpt?: string } | null>(null);

  const onBreakingNews = useCallback((article: { id: number; title: string; slug: string; excerpt: string }) => {
    setBreakingArticle(article);
  }, []);

  useWebSocket({ onBreakingNews });

  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/staff');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Admin dashboard renders standalone — no site header/footer/ads
  if (isAdmin) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/:tab" element={<AdminDashboard />} />
          <Route path="/admin/themes" element={<ThemeManager />} />
          <Route path="/admin/themes/customize" element={<ThemeCustomizer />} />
          <Route path="/admin/themes/import" element={<ThemeImport />} />
          <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="/staff/:tab" element={<StaffDashboard />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen font-sans"
      style={{
        backgroundColor: 'var(--color-background, #ffffff)',
        color: 'var(--color-text, #111827)',
      }}>

      {/* Top Ad Banner - scrolls away naturally */}
      <div ref={adRef} className="w-full bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-white/5">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex flex-col items-center">
          <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-1.5 self-end">Advertisement</span>
          {topAds.length > 0 ? (
            <AdBanner ad={topAds[0]} placement="top" className="w-full h-24 md:h-32 lg:h-36" />
          ) : (
            <div className="w-full h-24 md:h-32 lg:h-36 bg-gray-200 dark:bg-white/5 flex items-center justify-center border border-dashed border-gray-300 dark:border-white/10">
              <div className="text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Advertisement</p>
                <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">728×90 · 970×90 · 970×250</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <BreakingNewsBanner article={breakingArticle} onDismiss={() => setBreakingArticle(null)} />
      <Header />

      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/team" element={<OurTeamPage />} />
            <Route path="/advertise" element={<AdvertisePage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/tos" element={<TermsOfServicePage />} />
            <Route path="/:slug" element={<ArticlePage />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>

      <Footer />
      <ConsentModal />
    </div>
  );
}

export default function App() {
  const defaultTheme = getDefaultTheme();
  
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme={defaultTheme.config}>
        <ThemeLoader />
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
