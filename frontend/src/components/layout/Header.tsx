import { Search, X, Facebook, Twitter, Instagram, PlusCircle, BarChart3, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState, useEffect, useMemo, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import ThemeToggle from '../ui/ThemeToggle';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import { useAppContext } from '../../context/AppContext';
import AdminCreatePost from '../admin/AdminCreatePost';
import AdminManageAds from '../admin/AdminManageAds';
import { apiGetActiveNewsTypes, apiGetSocials } from '../../lib/api';
import { useThemeComponents } from '../../themes/useTheme';
import { getArticleUrl } from '../../lib/urls';

const CATEGORY_SLUG: Record<string, string> = {};

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Get user timezone abbreviation
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzAbbr = new Intl.DateTimeFormat('en', { timeZoneName: 'short', timeZone: tz })
    .formatToParts(time)
    .find(p => p.type === 'timeZoneName')?.value || '';

  const date = time.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  return (
    <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
      <span>{date}</span>
      <span className="w-px h-3 bg-gray-300 dark:bg-white/20"></span>
      <span className="font-mono text-amber-600 dark:text-amber-500">{timeStr}</span>
      <span className="text-[10px] text-gray-400 dark:text-gray-500">{tzAbbr}</span>
    </div>
  );
}

function Header() {
  const { isAdmin, news } = useAppContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdsModalOpen, setIsAdsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [navCategories, setNavCategories] = useState<{ name: string; slug: string }[]>([]);
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string; icon: string }[]>([]);
  const headerCfg = useThemeComponents()?.header;
  const headerStyle = headerCfg?.style || 'classic';
  const isMinimal = headerStyle === 'minimal';
  const isModern = headerStyle === 'modern';

  useEffect(() => {
    apiGetActiveNewsTypes().then(types => {
      const items = types.map(t => ({ name: t.name, slug: t.slug }));
      setNavCategories(items);
      items.forEach(t => { CATEGORY_SLUG[t.name] = t.slug; });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    apiGetSocials().then(links => {
      setSocialLinks(links.map(l => ({ platform: l.platform, url: l.url, icon: l.icon })));
    }).catch(() => {});
  }, []);

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return news.filter(s =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 6);
  }, [searchQuery, news]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    if (!isMenuOpen) setSearchQuery('');
  }, [isMenuOpen]);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchRef.current?.focus(), 100);
    else setSearchQuery('');
  }, [isSearchOpen]);

  const topBar = !isMinimal && (
    <div className="hidden md:flex justify-between items-center px-6 lg:px-10 py-2 border-b border-gray-100 dark:border-white/5"
      style={{ backgroundColor: 'var(--color-background-alt, #ffffff)', borderBottomColor: 'var(--color-border-light, #f3f4f6)' }}>
      <LiveClock />
      {headerCfg?.showSocial !== false && (
        <div className="flex items-center gap-3">
          {socialLinks.map(s => (
            <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
              className="text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors capitalize text-xs font-bold" title={s.platform}>
              {s.platform === 'whatsapp' ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              ) : s.platform === 'facebook' ? (
                <Facebook className="w-3.5 h-3.5" />
              ) : s.platform === 'twitter' || s.platform === 'x' ? (
                <Twitter className="w-3.5 h-3.5" />
              ) : s.platform === 'instagram' ? (
                <Instagram className="w-3.5 h-3.5" />
              ) : (
                <span>{s.platform[0].toUpperCase()}</span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const mainBar = (
    <div className={cn(
      "flex items-center px-4 lg:px-8 h-16 md:h-20 transition-all duration-300",
      isScrolled ? "h-14 shadow-md shadow-amber-600/5" : ""
    )}
    style={{
      backgroundColor: isModern ? 'var(--color-background-dark, #0f172a)' : 'var(--color-background, #ffffff)',
    }}>

      {/* Left: Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Logo />
      </div>

      {/* Center: Category Nav (desktop) */}
      <nav className="hidden lg:flex flex-1 justify-center">
        <ul className="flex gap-1 text-[11px] font-bold uppercase tracking-wider">
          {navCategories.map(item => (
            <li key={item.slug}>
              <Link
                to={`/category/${item.slug}`}
                className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-600/10 rounded transition-all"
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/about"
              className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-600/10 rounded transition-all">
              About JM News
            </Link>
          </li>
        </ul>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 ml-auto">

        {/* Search */}
        {headerCfg?.showSearch !== false && (
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(v => !v)}
              className="p-2 rounded hover:bg-amber-50 dark:hover:bg-amber-600/10 text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-all"
            >
              <Search className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 260 }}
                  exit={{ opacity: 0, width: 0 }}
                  className="absolute right-0 top-full mt-2 z-50 overflow-hidden"
                >
                  <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-amber-600/20 shadow-xl rounded">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-white/5">
                      <Search className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search JM News..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="flex-1 text-xs bg-transparent focus:outline-none text-gray-800 dark:text-white placeholder:text-gray-400"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')}>
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      )}
                    </div>
                    {searchResults.length > 0 && (
                      <div className="max-h-72 overflow-y-auto">
                        {searchResults.map(s => (
                          <Link
                            key={s.id}
                            to={getArticleUrl(s)}
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-600/10 border-b border-gray-50 dark:border-white/5 last:border-0 group"
                          >
                            <div className="w-8 h-8 shrink-0 overflow-hidden bg-gray-100">
                              <img src={s.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="block text-[9px] font-black uppercase text-amber-600">{s.category}</span>
                              <span className="block text-[11px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-amber-600 line-clamp-1">{s.title}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                      <p className="px-3 py-3 text-xs text-gray-400 text-center">No results for "{searchQuery}"</p>
                    )}
                    {searchQuery.length >= 2 && (
                      <Link
                        to={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                        className="block px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-600/10 text-center border-t border-gray-100 dark:border-white/5"
                      >
                        View all results →
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Admin buttons */}
        {isAdmin && (
          <>
            <button onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded transition-all">
              <PlusCircle className="w-3.5 h-3.5" />
              Post
            </button>
            <button onClick={() => setIsAdsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-600/40 text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-widest rounded hover:bg-amber-50 dark:hover:bg-amber-600/10 transition-all">
              <BarChart3 className="w-3.5 h-3.5" />
              Ads
            </button>
          </>
        )}

        {headerCfg?.showDarkModeToggle !== false && <ThemeToggle />}
        {isAdmin && <ThemeSwitcher />}

        {/* Mobile menu */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="lg:hidden p-2 rounded hover:bg-amber-50 dark:hover:bg-amber-600/10 text-gray-500 dark:text-gray-400 hover:text-amber-600 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <header className={cn(
      "w-full border-b",
      isModern ? 'border-b-0' : 'border-gray-200 dark:border-amber-600/20',
      headerCfg?.sticky !== false ? 'sticky top-0 z-50' : 'relative'
    )}
    style={{
      backgroundColor: isModern ? 'var(--color-background-dark, #0f172a)' : 'var(--color-background, #ffffff)',
      borderBottomColor: 'var(--color-border, #e5e7eb)',
    }}>
      {topBar}
      {mainBar}
      {!isMinimal && (
        <div className="h-[2px] bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 dark:from-amber-700 dark:via-amber-500 dark:to-amber-700" />
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]" />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-full max-w-xs z-[70] shadow-2xl flex flex-col border-r border-amber-600/20"
              style={{ backgroundColor: 'var(--color-background, #ffffff)' }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                <Logo />
                <div className="flex items-center gap-2">
                  {headerCfg?.showDarkModeToggle !== false && <ThemeToggle />}
                  <button onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors">
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Mobile Search */}
              {headerCfg?.showSearch !== false && (
                <div className="p-4 border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded px-3 py-2">
                    <Search className="w-4 h-4 text-amber-600 shrink-0" />
                    <input type="text" placeholder="Search news..."
                      value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 dark:text-white placeholder:text-gray-400" />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-gray-100 dark:border-white/5 rounded overflow-hidden">
                      {searchResults.map(s => (
                        <Link key={s.id} to={getArticleUrl(s)}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-600/10 border-b border-gray-50 dark:border-white/5 last:border-0">
                          <div className="w-8 h-8 shrink-0 overflow-hidden bg-gray-100">
                            <img src={s.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{s.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                <nav className="p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Sections</p>
                  <ul className="flex flex-col">
                    {navCategories.map(item => (
                      <li key={item.slug}>
                        <Link
                          to={`/category/${item.slug}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-between py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 border-b border-gray-50 dark:border-white/5 transition-colors"
                        >
                          {item.name}
                          <span className="text-gray-300 dark:text-white/20">›</span>
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link to="/about" onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between py-3 text-sm font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 border-b border-gray-50 dark:border-white/5 transition-colors">
                        About JM News
                        <span className="text-amber-400 dark:text-amber-600">›</span>
                      </Link>
                    </li>
                  </ul>
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-white/5">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Top Stories</p>
                  <div className="flex flex-col gap-3">
                    {news.slice(0, 3).map(s => (
                      <Link key={s.id} to={getArticleUrl(s)} onClick={() => setIsMenuOpen(false)}
                        className="flex gap-3 group">
                        <div className="w-16 h-12 shrink-0 overflow-hidden bg-gray-100">
                          <img src={s.imageUrl} alt={s.title} referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div>
                          <span className="block text-[9px] font-black uppercase text-amber-600 mb-0.5">{s.category}</span>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-amber-600 line-clamp-2 transition-colors">{s.title}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-white/5">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Follow Us</p>
                  <div className="flex gap-3">
                    {socialLinks.map(s => (
                      <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                        className="p-2 bg-gray-100 dark:bg-white/5 rounded hover:bg-amber-600 hover:text-white text-gray-600 dark:text-gray-400 transition-all" title={s.platform}>
                        {s.platform === 'facebook' ? <Facebook className="w-4 h-4" /> :
                         s.platform === 'twitter' || s.platform === 'x' ? <Twitter className="w-4 h-4" /> :
                         s.platform === 'instagram' ? <Instagram className="w-4 h-4" /> :
                         <span className="text-xs font-bold uppercase">{s.platform[0]}</span>}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AdminCreatePost isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <AdminManageAds isOpen={isAdsModalOpen} onClose={() => setIsAdsModalOpen(false)} />
    </header>
  );
}

export default memo(Header);
