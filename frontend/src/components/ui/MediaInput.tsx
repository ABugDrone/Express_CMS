/**
 * MediaInput — reusable media field with two modes:
 *   • URL  — paste any external link
 *   • Upload — drag-and-drop or click to upload directly to the backend
 *
 * Shows a live preview and upload progress bar.
 * Displays format/size specs relevant to the context.
 */
import React, { useRef, useState, useCallback } from 'react';
import { Upload, Link as LinkIcon, X, CheckCircle, AlertTriangle, Loader2, Image as ImageIcon, Video } from 'lucide-react';
import { apiUploadFile, UploadContext } from '../../lib/api';

// ── Spec definitions ──────────────────────────────────────────────────────────

const SPECS: Record<UploadContext, {
  label: string;
  accept: string;
  formats: string;
  maxSizeMB: number;
  dimensions?: string;
  notes?: string;
}> = {
  profile: {
    label:      'Profile Photo',
    accept:     'image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif',
    formats:    'JPG · PNG · WebP · AVIF · HEIC · HEIF',
    maxSizeMB:  5,
    dimensions: 'Recommended: 400×400 px (1:1 square)',
    notes:      'Will be displayed as a circle. Keep the subject centred.',
  },
  news_image: {
    label:      'Article Image',
    accept:     'image/jpeg,image/png,image/webp,image/avif,image/gif,image/tiff,image/bmp,image/heic,image/heif',
    formats:    'JPG · PNG · WebP · AVIF · GIF · TIFF · BMP · HEIC · HEIF',
    maxSizeMB:  20,
    dimensions: 'Recommended: 1200×800 px (3:2) · Min 800 px wide',
    notes:      'Used as the article hero image. Landscape orientation preferred.',
  },
  news_video: {
    label:      'Article Video',
    accept:     'video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,video/3gpp',
    formats:    'MP4 · WebM · OGG · MOV · AVI · MKV · 3GP',
    maxSizeMB:  200,
    dimensions: 'Recommended: 1920×1080 (16:9 Full HD)',
    notes:      'H.264 + AAC preferred for broadest compatibility.',
  },
  ad_image: {
    label:      'Ad Image / Banner',
    accept:     'image/jpeg,image/png,image/gif,image/webp,image/avif',
    formats:    'JPG · PNG · GIF (animated) · WebP · AVIF',
    maxSizeMB:  10,
    dimensions: [
      'Top Banner:    1200×250 px (desktop) · 728×90 (tablet) · 320×50 (mobile)',
      'Left Sidebar:  160×600 px (desktop) · 120×600 (tablet)',
      'Right Sidebar: 300×600 px (desktop) · 300×250 (tablet)',
      'Middle Strip:  728×90 px (desktop) · 300×250 (mobile)',
    ].join('\n'),
    notes: 'Use GIF for animated banners. Keep file size under 5 MB for GIFs.',
  },
  ad_video: {
    label:      'Ad Video',
    accept:     'video/mp4,video/webm',
    formats:    'MP4 · WebM',
    maxSizeMB:  200,
    dimensions: '1920×1080 (16:9) · Max 60 seconds recommended',
    notes:      'H.264 video + AAC audio. Will autoplay muted in banner slots.',
  },
  comment_avatar: {
    label:      'Comment Avatar',
    accept:     'image/jpeg,image/png,image/webp,image/gif',
    formats:    'JPG · PNG · WebP · GIF',
    maxSizeMB:  2,
    dimensions: 'Recommended: 128×128 px (1:1 square)',
    notes:      'Will be displayed as a small circle next to your comment.',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

interface MediaInputProps {
  context: UploadContext;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function MediaInput({
  context,
  value,
  onChange,
  label,
  placeholder,
  className = '',
}: MediaInputProps) {
  const spec = SPECS[context];
  const isVideo = context === 'news_video' || context === 'ad_video';

  const [mode, setMode]         = useState<'url' | 'upload'>('url');
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setError('');
    setSuccess(false);
    setProgress(0);
    try {
      const res = await apiUploadFile(file, context, setProgress);
      onChange(res.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message ?? 'Upload failed');
    } finally {
      setProgress(null);
    }
  }, [context, onChange]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const maxBytes = spec.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File too large. Max ${spec.maxSizeMB} MB (got ${(file.size / 1024 / 1024).toFixed(1)} MB)`);
      return;
    }
    upload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const isImage = !isVideo;
  const previewIsVideo = value && (
    value.endsWith('.mp4') || value.endsWith('.webm') ||
    value.endsWith('.ogv') || value.endsWith('.mov') ||
    value.includes('video')
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          {isVideo ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
          {label}
        </label>
      )}

      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 w-fit">
        {(['url', 'upload'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
              mode === m
                ? 'bg-vibrant-primary text-white'
                : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-vibrant-primary'
            }`}
          >
            {m === 'url' ? <LinkIcon className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
            {m === 'url' ? 'URL' : 'Upload'}
          </button>
        ))}
      </div>

      {/* URL mode */}
      {mode === 'url' && (
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder ?? `https://example.com/${isVideo ? 'video.mp4' : 'image.jpg'}`}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30 pr-10"
          />
          {value && (
            <button type="button" onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-vibrant-primary bg-vibrant-primary/5'
              : 'border-gray-200 dark:border-white/10 hover:border-vibrant-primary/50 hover:bg-vibrant-primary/5'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept={spec.accept}
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          {progress !== null ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-vibrant-primary animate-spin" />
              <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
                <div
                  className="h-2 bg-vibrant-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">{progress}% uploaded</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-2 text-green-600">
              <CheckCircle className="w-8 h-8" />
              <p className="text-xs font-black uppercase tracking-widest">Uploaded successfully</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                Drop file here or <span className="text-vibrant-primary">click to browse</span>
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                {spec.formats} · Max {spec.maxSizeMB} MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Preview */}
      {value && !error && (
        <div className="relative rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          {previewIsVideo ? (
            <video src={value} controls className="w-full max-h-40 object-contain" />
          ) : (
            <img src={value} alt="preview" className="w-full max-h-40 object-contain"
              onError={e => (e.currentTarget.style.display = 'none')} />
          )}
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Spec info */}
      <div className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed space-y-0.5">
        {spec.dimensions && spec.dimensions.split('\n').map((line, i) => (
          <p key={i} className="font-mono">{line}</p>
        ))}
        {spec.notes && <p className="italic">{spec.notes}</p>}
      </div>
    </div>
  );
}
