/**
 * RssWire — Live news wire widget.
 * Fetches headlines from The Punch and Daily Trust via the backend RSS proxy.
 * Each headline links to the original article on the source site.
 * Attribution is always shown — this is a wire/aggregator, not republication.
 */
import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, RefreshCw, Rss, AlertCircle } from 'lucide-react';
import { apiGetRssFeed, RssItem } from '../../lib/api';

const SOURCES = [
  { key: 'all',        label: 'All' },
  { key: 'punch',      label: 'Punch' },
  { key: 'dailytrust', label: 'Daily Trust' },
] as const;

type SourceKey = typeof SOURCES[number]['key'];

// How long ago a date was, in human-readable form
function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RssWire() {
  const [items, setItems]       = useState<RssItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [source, setSource]     = useState<SourceKey>('all');
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const load = useCallback(async (src: SourceKey) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGetRssFeed(src === 'all' ? 'all' : src, 6);
      setItems(data);
      setLastFetch(new Date());
    } catch (err: any) {
      setError(err?.message ?? 'Could not load news wire');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(source); }, [source, load]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const t = setInterval(() => load(source), 10 * 60 * 1000);
    return () => clearInterval(t);
  }, [source, load]);

  return (
    <section className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          <Rss className="w-3.5 h-3.5 text-vibrant-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-vibrant-text dark:text-white">
            News Wire
          </span>
        </div>
        <div className="flex items-center gap-1">
          {lastFetch && (
            <span className="text-[9px] text-gray-400 hidden sm:block">
              {timeAgo(lastFetch.toISOString())}
            </span>
          )}
          <button
            onClick={() => load(source)}
            disabled={loading}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-vibrant-primary transition-colors disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Source tabs */}
      <div className="flex border-b border-gray-100 dark:border-white/5">
        {SOURCES.map(s => (
          <button
            key={s.key}
            onClick={() => setSource(s.key)}
            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors ${
              source === s.key
                ? 'bg-vibrant-primary text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-vibrant-primary hover:bg-vibrant-primary/5'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-50 dark:divide-white/5">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading wire...</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 p-3 text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold">Wire unavailable</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{error}</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No headlines available.</p>
        ) : (
          items.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2.5 p-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group"
            >
              {/* Thumbnail */}
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="w-14 h-10 object-cover rounded shrink-0 bg-gray-100 dark:bg-white/5"
                  referrerPolicy="no-referrer"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <div className="w-14 h-10 rounded shrink-0 bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                  <Rss className="w-4 h-4 text-gray-300 dark:text-white/20" />
                </div>
              )}

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 group-hover:text-vibrant-primary transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {/* Source badge */}
                  <span
                    className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded text-white shrink-0"
                    style={{ backgroundColor: item.source_color }}
                  >
                    {item.source}
                  </span>
                  <span className="text-[9px] text-gray-400 truncate">
                    {timeAgo(item.published)}
                  </span>
                  <ExternalLink className="w-2.5 h-2.5 text-gray-300 dark:text-white/20 shrink-0 ml-auto" />
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Footer attribution */}
      <div className="px-3 py-2 border-t border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
        <p className="text-[8px] text-gray-400 dark:text-gray-600 text-center">
          Headlines from{' '}
          <a href="https://punchng.com" target="_blank" rel="noopener noreferrer"
            className="hover:text-vibrant-primary transition-colors">The Punch</a>
          {' & '}
          <a href="https://dailytrust.com" target="_blank" rel="noopener noreferrer"
            className="hover:text-vibrant-primary transition-colors">Daily Trust</a>
          {' · '}Click to read on source site
        </p>
      </div>
    </section>
  );
}
