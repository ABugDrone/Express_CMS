import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

const VARIANTS_DIR = '_variants';

export interface ImageVariant {
  suffix: string;
  width: number;
  height?: number;
  format: 'webp' | 'jpeg' | 'png';
  quality?: number;
}

export const THUMBNAIL_VARIANTS: ImageVariant[] = [
  { suffix: 'sm', width: 400, format: 'webp', quality: 80 },
  { suffix: 'sm', width: 400, format: 'jpeg', quality: 80 },
  { suffix: 'md', width: 800, format: 'webp', quality: 85 },
  { suffix: 'md', width: 800, format: 'jpeg', quality: 85 },
  { suffix: 'lg', width: 1200, format: 'webp', quality: 90 },
  { suffix: 'lg', width: 1200, format: 'jpeg', quality: 90 },
  { suffix: 'thumb', width: 150, height: 150, format: 'webp', quality: 70 },
  { suffix: 'thumb', width: 150, height: 150, format: 'jpeg', quality: 70 },
];

export function getVariantPath(originalPath: string, variant: ImageVariant): string {
  const dir = path.dirname(originalPath);
  const ext = path.extname(originalPath);
  const base = path.basename(originalPath, ext);
  return path.join(dir, VARIANTS_DIR, `${base}_${variant.suffix}.${variant.format}`);
}

export function getVariantUrl(originalUrl: string, variant: ImageVariant): string {
  const dir = path.dirname(originalUrl);
  const ext = path.extname(originalUrl);
  const base = path.basename(originalUrl, ext);
  return `${dir}/${VARIANTS_DIR}/${base}_${variant.suffix}.${variant.format}`;
}

export function getSrcSet(originalUrl: string): { webp: string; jpeg: string } {
  const webp = THUMBNAIL_VARIANTS
    .filter(v => v.format === 'webp' && v.suffix !== 'thumb')
    .map(v => `${getVariantUrl(originalUrl, v)} ${v.width}w`)
    .join(', ');
  const jpeg = THUMBNAIL_VARIANTS
    .filter(v => v.format === 'jpeg' && v.suffix !== 'thumb')
    .map(v => `${getVariantUrl(originalUrl, v)} ${v.width}w`)
    .join(', ');
  return { webp, jpeg };
}

export function getThumbnailUrl(originalUrl: string, format: 'webp' | 'jpeg' = 'webp'): string {
  const variant = THUMBNAIL_VARIANTS.find(v => v.suffix === 'thumb' && v.format === format);
  if (!variant) return originalUrl;
  return getVariantUrl(originalUrl, variant);
}

export async function generateVariants(filePath: string): Promise<string[]> {
  const generated: string[] = [];
  const stat = await fs.stat(filePath);
  if (!stat.isFile()) return generated;

  const variantsDir = path.join(path.dirname(filePath), VARIANTS_DIR);
  await fs.mkdir(variantsDir, { recursive: true });

  for (const variant of THUMBNAIL_VARIANTS) {
    const outputPath = getVariantPath(filePath, variant);
    try {
      let pipeline = sharp(filePath)
        .resize(variant.width, variant.height, {
          fit: variant.height ? 'cover' : 'inside',
          withoutEnlargement: true,
        });

      if (variant.format === 'webp') {
        pipeline = pipeline.webp({ quality: variant.quality });
      } else if (variant.format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality: variant.quality, mozjpeg: true });
      } else {
        pipeline = pipeline.png({ quality: variant.quality });
      }

      await pipeline.toFile(outputPath);
      generated.push(outputPath);
    } catch (err) {
      console.error(`Failed to generate variant ${variant.suffix}.${variant.format}:`, err);
    }
  }

  return generated;
}

export async function transformImage(
  filePath: string,
  options: { width?: number; height?: number; format?: 'webp' | 'jpeg' | 'png'; quality?: number }
): Promise<Buffer> {
  let pipeline = sharp(filePath);

  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const fmt = options.format || 'webp';
  if (fmt === 'webp') {
    pipeline = pipeline.webp({ quality: options.quality ?? 85 });
  } else if (fmt === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: options.quality ?? 85, mozjpeg: true });
  } else {
    pipeline = pipeline.png({ quality: options.quality ?? 85 });
  }

  return pipeline.toBuffer();
}
