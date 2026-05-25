import { useAppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { useMemo, memo } from 'react';
import AdBanner from '../components/ads/AdBanner';
import { VideoReel } from '../components/news/VideoReelViewer';
import { getArticleUrl } from '../lib/urls';

// ── Shared primitives ──────────────────────────────────────────────
const AdStrip = memo(function AdStrip({ ad }: { ad: any }) {
  return (
    <div className="w-full bg-gray-50 dark:bg-[#111] border-y border-gray-200 dark:border-white/5 py-3 my-8">
      <div className="flex flex-col items-center">
        <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-1.5 self-end pr-1">Advertisement</span>
        {ad && ad.isActive ? (
          <AdBanner ad={ad} placement="middle" className="w-full h-24 md:h-32 lg:h-36" />
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
  );
});

const SectionLabel = memo(function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-[3px] h-4 bg-amber-600 inline-block shrink-0" />
      <span className="text-[11px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-200">
        {text}
      </span>
    </div>
  );
});

const SectionTitle = memo(function SectionTitle({ text }: { text: string }) {
  return (
    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-white/10 pb-3">
      {text}
    </h2>
  );
});

const HeadlineLink = memo(function HeadlineLink({ story }: { story: any }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(getArticleUrl(story))}
      className="cursor-pointer group py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0 flex items-center justify-between gap-3"
    >
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-amber-600 dark:group-hover:text-amber-500 leading-snug transition-colors flex-1">
        {story.title}
      </p>
      <div className="w-14 h-10 shrink-0 overflow-hidden bg-gray-100 dark:bg-white/5">
        <img src={story.imageUrl} alt={story.title} referrerPolicy="no-referrer" loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
    </div>
  );
});

const LiveBadge = memo(function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-600 mr-1">
      <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" />
      Live Updates :
    </span>
  );
});

const FeaturedCard = memo(function FeaturedCard({ story, showExcerpt = false }: { story: any; showExcerpt?: boolean }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(getArticleUrl(story))} className="cursor-pointer group">
      <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-white/5 mb-3">
        <img src={story.imageUrl} alt={story.title} referrerPolicy="no-referrer" loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 leading-snug transition-colors mb-1">
        {story.title}
      </h3>
      {showExcerpt && (
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{story.excerpt}</p>
      )}
    </div>
  );
});

const PhotoCard = memo(function PhotoCard({ story }: { story: any }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(getArticleUrl(story))} className="cursor-pointer group">
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-white/5 mb-2 relative">
        <img src={story.imageUrl} alt={story.title} referrerPolicy="no-referrer" loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Gallery</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-amber-600 transition-colors leading-snug">
        {story.title}
      </p>
    </div>
  );
});

const VideoCard = memo(function VideoCard({ story }: { story: any }) {
  const navigate = useNavigate();
  const c0 = (story.id.charCodeAt(0) || 48) % 5 + 1;
  const c1 = (story.id.charCodeAt(1) || 48) % 59;
  const mins = c0;
  const secs = String(c1).padStart(2, '0');
  return (
    <div onClick={() => navigate(getArticleUrl(story))} className="cursor-pointer group">
      <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-white/5 mb-2 relative">
        <img src={story.imageUrl} alt={story.title} referrerPolicy="no-referrer" loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 flex items-end p-2">
          <span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5">▶ {mins}:{secs}</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">
        {story.title}
      </p>
    </div>
  );
});

// ── Main Page ──────────────────────────────────────────────────────
export default function HomePage() {
  const { news, newsLoading, getAdsByPlacement } = useAppContext();
  const navigate = useNavigate();

  const middleAds = getAdsByPlacement('middle');

  // Show spinner only on the very first load (no data yet)
  if (news.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        {newsLoading ? (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <div className="w-10 h-10 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold uppercase tracking-widest">Loading news...</p>
          </div>
        ) : (
          <div className="text-center max-w-sm px-6">
            <div className="text-5xl mb-4">📰</div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">No Articles Yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Log in to the Admin Portal and publish your first story.
            </p>
          </div>
        )}
      </div>
    );
  }

  const featured  = news.find(n => n.isFeatured) || news[0];
  const breaking  = useMemo(() => news.filter(n => n.isBreaking), [news]);
  const all       = useMemo(() => news.filter(n => n.id !== featured?.id), [news, featured?.id]);

  const politics  = useMemo(() => news.filter(n => n.category === 'Politics'), [news]);
  const business  = useMemo(() => news.filter(n => n.category === 'Business'), [news]);
  const sports    = useMemo(() => news.filter(n => n.category === 'Sports'), [news]);
  const education = useMemo(() => news.filter(n => n.category === 'Education'), [news]);
  const health    = useMemo(() => news.filter(n => n.category === 'Health'), [news]);
  const agri      = useMemo(() => news.filter(n => n.category === 'Agri & Environ'), [news]);

  // Need at least one article to render
  if (!featured) return null;

  return (
    <div className="bg-white dark:bg-[#0a0a0a] min-h-screen text-gray-900 dark:text-white">

      {/* Breaking ticker */}
      {breaking.length > 0 && (
        <div className="border-b border-gray-100 dark:border-white/5">
          <div className="max-w-screen-xl mx-auto flex items-stretch overflow-hidden">
            <div className="bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-4 flex items-center shrink-0 gap-1.5 py-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Breaking
            </div>
            <div className="overflow-hidden flex-1 bg-gray-50 dark:bg-[#111]">
              <div className="flex animate-marquee whitespace-nowrap py-2 px-4 gap-16">
                {[...breaking, ...breaking].map((s, i) => (
                  <span key={i} onClick={() => navigate(getArticleUrl(s))}
                    className="text-xs font-semibold text-gray-700 dark:text-gray-300 inline-flex items-center gap-2 shrink-0 cursor-pointer hover:text-amber-600 transition-colors">
                    <span className="w-1 h-1 bg-amber-500 rounded-full" />
                    {s.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Ad - removed, now handled globally in App.tsx above header */}

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6">

        {/* ── SECTION 1: Top Stories (CNN-style 3-col) ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-gray-200 dark:border-white/10 pb-8 mb-8">

          {/* Col 1: News Headlines */}
          <div className="md:border-r border-gray-200 dark:border-white/10 md:pr-6 py-0">
            <SectionLabel text="News Headlines" />
            <div className="flex flex-col gap-0">
              {/* Featured story at top */}
              <div onClick={() => navigate(getArticleUrl(featured))}
                className="cursor-pointer group mb-3 pb-3 border-b border-gray-100 dark:border-white/5">
                <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-white/5 mb-2">
                  <img src={featured.imageUrl} alt={featured.title} referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors leading-snug">
                  {featured.title}
                </h2>
              </div>
              {/* Breaking/Live headlines - WITH images */}
              {breaking.slice(0, 2).map((s) => (
                <div key={s.id} onClick={() => navigate(getArticleUrl(s))}
                  className="cursor-pointer py-2.5 border-b border-gray-100 dark:border-white/5 group flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug group-hover:text-amber-600 transition-colors flex-1">
                    <LiveBadge />{s.title}
                  </p>
                  <div className="w-14 h-10 shrink-0 overflow-hidden bg-gray-100 dark:bg-white/5">
                    <img src={s.imageUrl} alt={s.title} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </div>
              ))}
              {/* Rest - text only, no images */}
              {all.slice(6, 12).map((s) => (
                <div key={s.id} onClick={() => navigate(getArticleUrl(s))}
                  className="cursor-pointer py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0 group">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug group-hover:text-amber-600 transition-colors">{s.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Photo gallery (was Col 1) */}
          <div className="md:px-6 py-4 md:py-0 border-b md:border-b-0 border-gray-100 dark:border-white/5 md:border-r md:border-gray-200 dark:md:border-white/10">
            <SectionLabel text="Latest News" />
            <div className="grid grid-cols-2 gap-3">
              {all.slice(9, 17).map(s => <PhotoCard key={s.id} story={s} />)}
            </div>
          </div>

          {/* Col 3: Headline list */}
          <div className="md:pl-6">
            <SectionLabel text="Top Stories" />
            {all.slice(0, 10).map(s => <HeadlineLink key={s.id} story={s} />)}
          </div>
        </section>

        {/* Ad between Latest News → Featured */}
        <AdStrip ad={middleAds[0] || null} />

        {/* ── SECTION 2: Featured (3-col with image cards) ── */}
        {(politics.length > 0 || business.length > 0 || education.length > 0) && (
        <section className="border-b border-gray-200 dark:border-white/10 pb-8 mb-0">
          <SectionTitle text="Featured" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(politics[0] || all[0]) && (
            <div>
              <SectionLabel text="Politics" />
              <FeaturedCard story={politics[0] || all[0]} showExcerpt />
              <div className="mt-3 flex flex-col gap-0">
                {politics.slice(1, 4).map(s => <HeadlineLink key={s.id} story={s} />)}
              </div>
            </div>
            )}
            {(business[0] || all[4]) && (
            <div>
              <SectionLabel text="Business" />
              <FeaturedCard story={business[0] || all[4]} showExcerpt />
              <div className="mt-3 flex flex-col gap-0">
                {business.slice(1, 4).map(s => <HeadlineLink key={s.id} story={s} />)}
              </div>
            </div>
            )}
            {(education[0] || all[8]) && (
            <div>
              <SectionLabel text="Education" />
              <FeaturedCard story={education[0] || all[8]} showExcerpt />
              <div className="mt-3 flex flex-col gap-0">
                {education.slice(1, 4).map(s => <HeadlineLink key={s.id} story={s} />)}
              </div>
            </div>
            )}
          </div>
        </section>
        )}

        {/* Ad between Featured → Latest Stories */}
        <AdStrip ad={middleAds[1] || middleAds[0] || null} />

        {/* ── SECTION 3: Video Reel ── */}
        {all.length > 0 && (
        <div className="border-b border-gray-200 dark:border-white/10 pb-8 mb-0">
          <VideoReel stories={all.slice(0, 10)} title="Latest Stories" />
        </div>
        )}

        {/* Ad between Latest Stories → Something Extra */}
        <AdStrip ad={middleAds[0] || null} />

        {/* ── SECTION 4: Something Extra (3-col) ── */}
        {(sports.length > 0 || health.length > 0 || agri.length > 0) && (
        <section className="border-b border-gray-200 dark:border-white/10 pb-8 mb-0">
          <SectionTitle text="Something Extra" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(sports[0] || all[12]) && (
            <div>
              <SectionLabel text="Sports" />
              <FeaturedCard story={sports[0] || all[12]} showExcerpt />
              <div className="mt-3 flex flex-col gap-0">
                {sports.slice(1, 4).map(s => <HeadlineLink key={s.id} story={s} />)}
              </div>
            </div>
            )}
            {(health[0] || all[14]) && (
            <div>
              <SectionLabel text="Health" />
              <FeaturedCard story={health[0] || all[14]} showExcerpt />
              <div className="mt-3 flex flex-col gap-0">
                {health.slice(1, 3).map(s => <HeadlineLink key={s.id} story={s} />)}
              </div>
            </div>
            )}
            {(agri[0] || all[16]) && (
            <div>
              <SectionLabel text="Agri & Environ" />
              <FeaturedCard story={agri[0] || all[16]} showExcerpt />
              <div className="mt-3 flex flex-col gap-0">
                {agri.slice(1, 3).map(s => <HeadlineLink key={s.id} story={s} />)}
              </div>
            </div>
            )}
          </div>
        </section>
        )}

        {/* Ad between Something Extra → Video */}
        <AdStrip ad={middleAds[1] || middleAds[0] || null} />

        {/* ── SECTION 5: Second Video Reel ── */}
        {all.length > 10 && (
        <div className="pb-8">
          <VideoReel stories={all.slice(10, 20)} title="Video" />
        </div>
        )}

      </div>
    </div>
  );
}
