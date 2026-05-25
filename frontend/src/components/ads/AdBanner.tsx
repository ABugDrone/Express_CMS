import React from 'react';
import { Advertisement } from '../../types';
import { apiTrackAdClick } from '../../lib/api';

interface AdBannerProps {
  ad: Advertisement;
  placement: 'top' | 'left' | 'right' | 'middle';
  className?: string;
}

function trackClick(ad: Advertisement) {
  const numId = Number(ad.id);
  if (!isNaN(numId)) apiTrackAdClick(numId).catch(() => {});
}

function sanitizeAdsense(code: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = code;
  const scripts = temp.querySelectorAll('script');
  scripts.forEach((s) => {
    if (s.src && !s.src.startsWith('https://pagead2.googlesyndication.com/') && !s.src.startsWith('https://www.googletagservices.com/')) {
      s.remove();
    }
  });
  const iframes = temp.querySelectorAll('iframe');
  iframes.forEach((f) => {
    if (f.src && !f.src.includes('googleads') && !f.src.includes('googlesyndication')) {
      f.remove();
    }
  });
  return temp.innerHTML;
}

export default function AdBanner({ ad, placement, className = '' }: AdBannerProps) {
  if (!ad || !ad.isActive) return null;

  const today = new Date().toISOString().split('T')[0];
  if (ad.startDate && ad.endDate && (today < ad.startDate || today > ad.endDate)) {
    return null;
  }

  if (ad.type === 'static_image' && ad.imageUrl) {
    return (
      <a
        href={ad.redirectUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick(ad)}
        className={`block overflow-hidden rounded-vibrant shadow-vibrant hover:shadow-lg transition-all hover:scale-105 ${className}`}
        title={ad.title}
      >
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/1200/250';
          }}
        />
      </a>
    );
  }

  if (ad.type === 'animated_banner' && ad.bannerUrl) {
    return (
      <a
        href={ad.redirectUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick(ad)}
        className={`block overflow-hidden rounded-vibrant shadow-vibrant hover:shadow-lg transition-all hover:scale-105 ${className}`}
        title={ad.title}
      >
        <img
          src={ad.bannerUrl}
          alt={ad.title}
          className="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/1200/250';
          }}
        />
      </a>
    );
  }

  if (ad.type === 'video' && ad.videoUrl) {
    return (
      <div className={`overflow-hidden rounded-vibrant shadow-vibrant ${className}`}>
        <iframe
          src={ad.videoUrl}
          title={ad.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          loading="lazy"
        />
      </div>
    );
  }

  if (ad.type === 'video' && ad.videoFile) {
    return (
      <div className={`overflow-hidden rounded-vibrant shadow-vibrant bg-black ${className}`}>
        <video
          src={ad.videoFile}
          controls
          className="w-full h-full object-cover"
          poster={ad.imageUrl}
          preload="metadata"
        />
      </div>
    );
  }

  if (ad.type === 'adsense' && ad.adsenseCode) {
    return (
      <div
        className={`overflow-hidden rounded-vibrant ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeAdsense(ad.adsenseCode) }}
      />
    );
  }

  return null;
}
