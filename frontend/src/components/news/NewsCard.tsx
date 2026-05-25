import { NewsItem } from '../../types';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { getArticleUrl } from '../../lib/urls';

interface NewsCardProps {
  story: NewsItem;
  variant?: 'compact' | 'standard' | 'large';
  key?: string | number;
}

export default function NewsCard({ story, variant = 'standard' }: NewsCardProps) {
  const navigate = useNavigate();

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => navigate(getArticleUrl(story))}
      className={cn(
        "group cursor-pointer flex flex-col gap-2 bg-vibrant-surface rounded-vibrant transition-all duration-300",
        variant === 'large' ? "md:grid md:grid-cols-2 lg:gap-8 p-0 overflow-hidden shadow-vibrant" : "p-2",
        variant === 'standard' ? "shadow-md hover:shadow-vibrant" : "",
        variant === 'compact' ? "flex-row gap-2 py-2 bg-transparent rounded-none" : ""
      )}
    >
      <div className={cn(
        "overflow-hidden bg-gray-100 dark:bg-vibrant-bg relative rounded-xl",
        variant === 'compact' ? "w-20 h-20 shrink-0" : "aspect-[16/10] w-full",
        variant === 'large' ? "rounded-none" : ""
      )}>
        <img 
          src={story.imageUrl} 
          alt={story.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {story.category && variant !== 'compact' && (
          <div className="absolute top-3 left-3 bg-vibrant-accent text-vibrant-neutral-dark text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full shadow-sm">
            {story.category}
          </div>
        )}
        {(story.videoUrl || story.driveUrl) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/0 transition-colors">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
              <Play className="w-6 h-6 text-white fill-current" />
            </div>
          </div>
        )}
      </div>

      <div className={cn("flex flex-col gap-2", variant === 'large' ? "p-8 justify-center" : "")}>
        {variant === 'compact' && (
          <div className="text-[10px] uppercase font-black tracking-widest text-vibrant-primary">
            {story.category}
          </div>
        )}
        <h3 className={cn(
          "font-bold leading-tight group-hover:text-vibrant-primary transition-colors text-vibrant-text",
          variant === 'large' ? "text-3xl lg:text-4xl" : variant === 'standard' ? "text-sm md:text-base" : "text-xs"
        )}>
          {story.title}
        </h3>
        
        {variant !== 'compact' && (
          <p className="text-vibrant-text-light text-xs line-clamp-2 leading-relaxed">
            {story.excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 mt-auto pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-vibrant-text">
            By {story.author}
          </span>
          <span className="w-1 h-1 bg-gray-300 dark:bg-vibrant-text-light rounded-full"></span>
          <span className="text-[11px] uppercase tracking-wider text-vibrant-text-light">
            {story.date}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
