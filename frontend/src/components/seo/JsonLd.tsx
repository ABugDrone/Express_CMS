interface JsonLdProps {
  data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function articleLd({
  title,
  description,
  imageUrl,
  url,
  publishedAt,
  updatedAt,
  author,
  publisherName = 'JM News',
  publisherLogo = '/favicon.svg',
}: {
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  publisherName?: string;
  publisherLogo?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    image: imageUrl || undefined,
    url,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: author ? { '@type': 'Person', name: author } : undefined,
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: { '@type': 'ImageObject', url: publisherLogo },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

export function organizationLd({
  name = 'JM News',
  url = 'https://jmnew.com.ng',
  logo = '/favicon.svg',
  description,
}: {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs: [],
  };
}

export function websiteLd({
  name = 'JM News',
  url = 'https://jmnew.com.ng',
  searchUrl = 'https://jmnew.com.ng/search?q={search_term_string}',
}: {
  name?: string;
  url?: string;
  searchUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: searchUrl },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
