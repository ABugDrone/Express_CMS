import { Helmet } from 'react-helmet-async';

interface SeoHeadProps {
  title: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  author?: string;
  tags?: string[];
  noIndex?: boolean;
}

export default function SeoHead({
  title,
  description,
  imageUrl,
  url,
  type = 'website',
  publishedAt,
  author,
  tags,
  noIndex,
}: SeoHeadProps) {
  const siteName = 'JM News';
  const fullTitle = `${title} | ${siteName}`;
  const desc = description || `${siteName} — ${title}`;
  const img = imageUrl || '/favicon.svg';
  const pageUrl = url || window.location.href;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {author && <meta property="article:author" content={author} />}
      {tags?.map(t => <meta key={t} property="article:tag" content={t} />)}
    </Helmet>
  );
}
