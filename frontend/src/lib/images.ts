const VARIANT_DIR = '_variants';

function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

function getBaseAndExt(url: string): { base: string; ext: string } {
  const dot = url.lastIndexOf('.');
  if (dot === -1) return { base: url, ext: '' };
  return { base: url.slice(0, dot), ext: url.slice(dot) };
}

/**
 * Get URL for a specific image variant (thumbnail, WebP, etc.)
 */
export function getImageVariantUrl(originalUrl: string, suffix: string, format: 'webp' | 'jpeg' | 'png' = 'webp'): string {
  if (isAbsoluteUrl(originalUrl) || !originalUrl.startsWith('/uploads/')) return originalUrl;
  const { base, ext } = getBaseAndExt(originalUrl.replace('/uploads/', ''));
  return `/uploads/${VARIANT_DIR}/${base}_${suffix}.${format}`;
}

/**
 * Get thumbnail URL (150x150 cover crop)
 */
export function getThumbnailUrl(originalUrl: string, format: 'webp' | 'jpeg' = 'webp'): string {
  return getImageVariantUrl(originalUrl, 'thumb', format);
}

/**
 * Get responsive srcSet string for <img> or <source> tags
 */
export function getSrcSet(originalUrl: string): { webp: string; jpeg: string } | null {
  if (isAbsoluteUrl(originalUrl) || !originalUrl.startsWith('/uploads/')) return null;
  const sizes = [
    { suffix: 'sm', width: 400 },
    { suffix: 'md', width: 800 },
    { suffix: 'lg', width: 1200 },
  ];
  const webp = sizes.map(s => `${getImageVariantUrl(originalUrl, s.suffix, 'webp')} ${s.width}w`).join(', ');
  const jpeg = sizes.map(s => `${getImageVariantUrl(originalUrl, s.suffix, 'jpeg')} ${s.width}w`).join(', ');
  return { webp, jpeg };
}

/**
 * Get the URL for an on-the-fly resized image via the backend API.
 * Falls back to the original URL if it's external.
 */
export function getResizedUrl(originalUrl: string, width: number, format: 'webp' | 'jpeg' = 'webp'): string {
  if (isAbsoluteUrl(originalUrl)) return originalUrl;
  return `/api/images/resize?url=${encodeURIComponent(originalUrl)}&w=${width}&format=${format}`;
}

/**
 * Generate <picture> element props for responsive images.
 * Returns null for external URLs.
 */
export function getPictureProps(originalUrl: string, widths?: number[]) {
  if (isAbsoluteUrl(originalUrl) || !originalUrl.startsWith('/uploads/')) return null;
  const sizes = widths || [400, 800, 1200];
  
  const webpSrcset = sizes.map(w => `${getResizedUrl(originalUrl, w, 'webp')} ${w}w`).join(', ');
  const jpegSrcset = sizes.map(w => `${getResizedUrl(originalUrl, w, 'jpeg')} ${w}w`).join(', ');

  return { webpSrcset, jpegSrcset, fallback: getResizedUrl(originalUrl, sizes[1], 'jpeg') };
}

/**
 * Generate sizes attribute based on a max-width container
 */
export function getSizes(breakpoints: Record<string, number> = { default: 100 }): string {
  return Object.entries(breakpoints)
    .sort(([a], [b]) => {
      if (a === 'default') return 1;
      if (b === 'default') return -1;
      return parseInt(b) - parseInt(a);
    })
    .map(([bp, cols]) => bp === 'default' ? `${cols}vw` : `(min-width: ${bp}px) ${cols}vw`)
    .join(', ');
}
