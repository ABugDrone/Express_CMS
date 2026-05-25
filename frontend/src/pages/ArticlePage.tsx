import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import CommentSection from '../components/news/CommentSection';
import { Calendar, Clock, Facebook, Twitter, Link as LinkIcon, ExternalLink, ShieldAlert, Check, Printer } from 'lucide-react';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import PageNav from '../components/ui/PageNav';
import { apiGetArticle, apiGetArticleBySlug, apiTrackArticleView } from '../lib/api';
import { NewsItem } from '../types';
import { useThemeComponents } from '../themes/useTheme';
import { getArticleUrl } from '../lib/urls';

const DEFAULT_TAGS = ['Regional', 'Governance', 'Adamawa'];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-0 mb-4">
      <span className="bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1">{title}</span>
      <div className="flex-1 h-[2px] bg-amber-600"></div>
    </div>
  );
}

export default function ArticlePage() {
  const { id, slug } = useParams();
  const { news } = useAppContext();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [story, setStory] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const components = useThemeComponents();
  const hasSidebar = components?.sidebar?.position !== 'none';
  const articlePageCfg = components?.articlePage;
  const newsRef = useRef(news);
  newsRef.current = news;

  const getEmbedUrl = useCallback((url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const vidId = url.split('v=')[1] || url.split('/').pop();
      return `https://www.youtube.com/embed/${vidId?.split('&')[0]}`;
    }
    if (url.includes('tiktok.com')) {
      const vidId = url.split('/video/')[1]?.split('?')[0];
      return `https://www.tiktok.com/embed/v2/${vidId}`;
    }
    if (url.includes('drive.google.com')) {
      return url.replace('/view', '/preview').replace('/edit', '/preview');
    }
    return null;
  }, []);

  const currentUrl = window.location.href;
  const shareLinks = useMemo(() => ({
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter:  `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(story?.title || '')}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${story?.title || ''} - ${currentUrl}`)}`,
  }), [currentUrl, story?.title]);

  const relatedArticles = useMemo(() => story ? news.filter(n => n.id !== story.id && n.category === story.category).slice(0, 3) : [], [news, story?.id, story?.category]);
  const paragraphs = useMemo(() => story?.content ? story.content.split('\n\n').filter(Boolean) : [], [story?.content]);

  // Try to load from backend first, fall back to context
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    const currentNews = newsRef.current;
    const fetchArticle = async () => {
      try {
        let a;
        if (slug) {
          a = await apiGetArticleBySlug(slug);
        } else if (id) {
          const numId = Number(id);
          if (isNaN(numId) || numId <= 0) throw new Error('Invalid ID');
          a = await apiGetArticle(numId);
        } else {
          throw new Error('No valid identifier');
        }
        setStory({
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
        });
        apiTrackArticleView(a.id).catch(() => {});
      } catch {
        const local = currentNews.find(n => n.id === id || n.slug === slug);
        setStory(local ?? null);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, id]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] min-h-[60vh] flex flex-col items-center justify-center p-10 text-center">
        <span className="bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-4">404</span>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Story Not Found</h2>
        <p className="text-gray-500 mb-6 text-sm">This article may have been moved or deleted.</p>
        <Link to="/" className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-widest transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  const videoEmbed = getEmbedUrl(story.videoUrl || '');
  const driveEmbed = getEmbedUrl(story.driveUrl || '');

  const copyToClipboard = async () => {
    try { await navigator.clipboard.writeText(currentUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4">

        {/* Breadcrumb */}
        <PageNav label={story.category} />

        <div className={`grid grid-cols-1 gap-6 ${hasSidebar ? 'lg:grid-cols-12' : ''}`}>
          {/* Main Article */}
          <article className={hasSidebar ? 'lg:col-span-9' : ''}>

            {/* Category + Title */}
            <div className="border-b-2 border-amber-600 pb-4 mb-4">
              <span className="inline-block bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 mb-2">{story.category}</span>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                {story.title}
              </h1>
            </div>

            {/* Byline */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-gray-100 dark:border-white/5 mb-4">
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-black">
                    {story.author.charAt(0)}
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">By {story.author}</span>
                </div>
                <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>{story.date}</span></div>
                <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>5 min read</span></div>
              </div>
              {/* Share */}
              <div className="flex items-center gap-1">
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors text-[#1877F2]"><Facebook className="w-4 h-4" /></a>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors text-[#1DA1F2]"><Twitter className="w-4 h-4" /></a>
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors text-green-600 text-xs font-bold">WA</a>
                <button onClick={copyToClipboard} className={`p-1.5 rounded transition-colors ${copied ? 'bg-green-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500'}`}>
                  {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                </button>
                <button onClick={() => window.print()} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded transition-colors text-gray-500" title="Download PDF">
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {!videoEmbed && (
              <div className="w-full aspect-video overflow-hidden mb-4 bg-gray-100">
                <img src={story.imageUrl} alt={story.title} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Video */}
            {videoEmbed && (
              <div className="w-full aspect-video overflow-hidden mb-4 bg-black">
                <iframe src={videoEmbed} className="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            )}

            {/* Drive */}
            {driveEmbed && (
              <div className="border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 p-4 mb-4">
                <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-500">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="font-black uppercase tracking-widest text-xs">Sensitive Material</span>
                </div>
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  <iframe src={driveEmbed} className="w-full h-full border-0" allowFullScreen />
                </div>
                <a href={story.driveUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600 hover:underline font-bold">
                  Open in Drive <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Article Body */}
            <div className="prose prose-sm dark:prose-invert max-w-none"
              style={articlePageCfg?.readingWidth ? { maxWidth: articlePageCfg.readingWidth } : undefined}>
              <p className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300 leading-relaxed border-l-4 border-amber-600 pl-4 mb-6 italic">
                {story.excerpt}
              </p>
              {story.content ? (
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-loose space-y-4">
                  {paragraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                  Full article content not available for this story.
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-white/5">
              {(story.tags.length > 0 ? story.tags : DEFAULT_TAGS).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">#{tag}</span>
              ))}
            </div>

            {/* Comments */}
            <div className="mt-8">
              <SectionHeader title="Comments" />
              <CommentSection articleId={story.id} />
            </div>

            {/* Related */}
            <div className="mt-8">
              <SectionHeader title="Continue Reading" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedArticles.map(s => (
                  <div key={s.id} onClick={() => navigate(getArticleUrl(s))} className="cursor-pointer group">
                    <div className="aspect-video overflow-hidden bg-gray-100 mb-2">
                      <img src={s.imageUrl} alt={s.title} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <span className="inline-block bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 mb-1">{s.category}</span>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors line-clamp-2">{s.title}</h4>
                    <span className="text-[10px] text-gray-400">{s.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          {hasSidebar && (
            <aside className="lg:col-span-3">
              <div className="sticky top-24">
                <Sidebar />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
