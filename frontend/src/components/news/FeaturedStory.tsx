import { NewsItem } from '../../types';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { getArticleUrl } from '../../lib/urls';

interface FeaturedStoryProps {
  story: NewsItem;
}

export default function FeaturedStory({ story }: FeaturedStoryProps) {
  const navigate = useNavigate();

  return (
    <section 
      className="w-full px-6 md:px-10 py-6"
      onClick={() => navigate(getArticleUrl(story))}
    >
      <div className="relative min-h-[125px] md:min-h-[150px] flex items-end overflow-hidden rounded-vibrant shadow-vibrant group cursor-pointer mx-auto max-w-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src={story.imageUrl} 
            alt={story.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-vibrant-primary/80 via-transparent to-vibrant-text/90"></div>
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>

        <div className="relative z-10 p-6 md:p-8 lg:p-10 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-3 md:gap-4"
          >
            <div className="inline-block self-start px-3 py-1 bg-vibrant-accent text-vibrant-text text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-lg">
              {story.category}
            </div>
            
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight md:leading-[1.1] tracking-tight">
              {story.title}
            </h2>
            
            <div className="flex items-center gap-4 text-sm font-medium text-white/90">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {story.author.charAt(0)}
                </span>
                {story.author}
              </span>
              <span className="opacity-50">•</span>
              <span>{story.date}</span>
              <span className="opacity-50 hidden sm:inline">•</span>
              <span className="hidden sm:inline">5 min read</span>
            </div>

            <button className="self-start px-8 py-3.5 bg-vibrant-primary text-white text-sm font-bold rounded-full transition-all hover:bg-vibrant-primary-dark hover:px-10 shadow-xl shadow-vibrant-primary/30">
              Read Analysis
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
