import { useState, useRef, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Share2, Facebook, Twitter, Link, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getArticleUrl } from '../../lib/urls';

interface Story {
  id: string;
  title: string;
  slug?: string;
  createdAt?: string;
  excerpt?: string;
  imageUrl: string;
  videoUrl?: string;
}

interface VideoReelViewerProps {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
}

export function VideoReelViewer({ stories, initialIndex = 0, onClose }: VideoReelViewerProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DURATION = 6000;

  const story = stories[current];
  const url = `${window.location.origin}${getArticleUrl(story)}`;

  useEffect(() => {
    setProgress(0);
    if (paused) return;
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / DURATION) * 100);
      if (p >= 100) {
        goNext();
        return;
      }
      setProgress(p);
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [current, paused]);

  const goNext = () => {
    if (current < stories.length - 1) setCurrent(c => c + 1);
    else onClose();
  };

  const goPrev = () => {
    if (current > 0) setCurrent(c => c - 1);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = useMemo(() => ({
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(story.title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${story.title} - ${url}`)}`,
  }), [url, story.title]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: i < current ? '100%' : i === current ? `${progress}%` : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Top bar */}
      <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-10 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white text-[10px] font-black">JM</div>
          <div>
            <p className="text-white text-xs font-bold leading-none">JM News</p>
            <p className="text-white/60 text-[10px]">{story.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={e => { e.stopPropagation(); setShowShare(s => !s); }}
            className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <Share2 className="w-4 h-4 text-white" />
          </button>
          <button onClick={e => { e.stopPropagation(); onClose(); }}
            className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Main image/video */}
      <div className="w-full h-full max-w-sm mx-auto relative">
        <img
          src={story.imageUrl}
          alt={story.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Category + Title */}
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <span className="inline-block bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 mb-2">
            {story.category}
          </span>
          <h2 className="text-white text-lg font-black leading-tight mb-2">{story.title}</h2>
          {story.excerpt && (
            <p className="text-white/70 text-xs leading-relaxed line-clamp-2">{story.excerpt}</p>
          )}
        </div>

        {/* Bottom actions */}
        <div className="absolute bottom-4 left-0 right-0 px-4 flex items-center justify-between">
          <a
            href={getArticleUrl(story)}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded transition-colors"
          >
            Read Full Story <ExternalLink className="w-3 h-3" />
          </a>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-[10px]">{current + 1}/{stories.length}</span>
            {paused && <span className="text-white/50 text-[10px] uppercase tracking-widest">Paused</span>}
          </div>
        </div>

        {/* Tap zones - always visible controls */}
        <button onClick={e => { e.stopPropagation(); goPrev(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full transition-colors z-10">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button onClick={e => { e.stopPropagation(); goNext(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full transition-colors z-10">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Pause/Play button - center tap */}
        <button onClick={e => { e.stopPropagation(); setPaused(p => !p); }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/30 hover:bg-black/50 rounded-full transition-all z-10">
          {paused
            ? <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            : <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          }
        </button>
      </div>

      {/* Share panel */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] rounded-t-2xl p-6 z-20 max-w-sm mx-auto"
          >
            <div className="w-10 h-1 bg-gray-300 dark:bg-white/20 rounded-full mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Share this story</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-4 line-clamp-2">{story.title}</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 transition-colors">
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-600">Facebook</span>
              </a>
              <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl hover:bg-sky-100 transition-colors">
                <Twitter className="w-5 h-5 text-sky-500" />
                <span className="text-[10px] font-bold text-sky-500">Twitter</span>
              </a>
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-[10px] font-bold text-green-600">WhatsApp</span>
              </a>
            </div>
            <button onClick={copyLink}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
              {copied ? <><Check className="w-4 h-4" /> Link Copied!</> : <><Link className="w-4 h-4" /> Copy Link</>}
            </button>
            <button onClick={() => setShowShare(false)}
              className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Horizontal scrollable reel with click-to-open viewer ──────────
interface VideoReelProps {
  stories: Story[];
  title?: string;
}

export function VideoReel({ stories, title = 'Video' }: VideoReelProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' });
  };

  const open = (i: number) => { setViewerIndex(i); setViewerOpen(true); };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-0">
          <span className="bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1">{title}</span>
          <div className="flex-1 h-[2px] bg-amber-600 w-12"></div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => scroll('left')}
            className="p-1.5 border border-gray-200 dark:border-white/10 hover:border-amber-600 hover:text-amber-600 rounded transition-colors text-gray-500 dark:text-gray-400">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll('right')}
            className="p-1.5 border border-gray-200 dark:border-white/10 hover:border-amber-600 hover:text-amber-600 rounded transition-colors text-gray-500 dark:text-gray-400">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {stories.map((s, i) => (
          <div key={s.id} onClick={() => open(i)}
            className="flex-shrink-0 w-48 md:w-56 cursor-pointer group">
            <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-white/5 mb-2 relative rounded">
              <img src={s.imageUrl} alt={s.title} referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-amber-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-1.5 left-1.5">
                <span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  ▶ {(() => { const c0 = (s.id.charCodeAt(0) || 48) % 5 + 1; const c1 = (s.id.charCodeAt(1) || 48) % 59; return `${c0}:${String(c1).padStart(2, '0')}`; })()}
                </span>
              </div>
              <div className="absolute top-1.5 left-1.5">
                <span className="bg-amber-600 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                  {s.category}
                </span>
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">
              {s.title}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.date}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {viewerOpen && (
          <VideoReelViewer
            stories={stories}
            initialIndex={viewerIndex}
            onClose={() => setViewerOpen(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
