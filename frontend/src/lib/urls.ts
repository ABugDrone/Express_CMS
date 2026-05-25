export function getArticleUrl(article: { slug?: string; id: string }) {
  if (article.slug) return `/${article.slug}`;
  return `/article/${article.id}`;
}
