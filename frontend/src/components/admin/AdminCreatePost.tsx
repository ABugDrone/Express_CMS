import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Send, ShieldAlert, Zap, Check } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Category, NewsItem } from '../../types';
import MediaInput from '../ui/MediaInput';

const ALL_CATEGORIES: Category[] = [
  'News', 'Politics', 'Opinion', 'Business', 'Health',
  'Agri & Environ', 'Education', 'Entertainment', 'Technology', 'Sports', 'Life',
];

// Colour accent per category for the chips
const CAT_COLORS: Record<string, string> = {
  'News':          'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10',
  'Politics':      'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/30',
  'Opinion':       'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/30',
  'Business':      'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700/30',
  'Health':        'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700/30',
  'Agri & Environ':'bg-lime-50 dark:bg-lime-900/20 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-700/30',
  'Education':     'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/30',
  'Entertainment': 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700/30',
  'Technology':    'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700/30',
  'Sports':        'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700/30',
  'Life':          'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700/30',
};

const CAT_SELECTED: Record<string, string> = {
  'News':          'bg-gray-700 text-white border-gray-700',
  'Politics':      'bg-blue-600 text-white border-blue-600',
  'Opinion':       'bg-purple-600 text-white border-purple-600',
  'Business':      'bg-green-600 text-white border-green-600',
  'Health':        'bg-red-600 text-white border-red-600',
  'Agri & Environ':'bg-lime-600 text-white border-lime-600',
  'Education':     'bg-yellow-500 text-white border-yellow-500',
  'Entertainment': 'bg-pink-600 text-white border-pink-600',
  'Technology':    'bg-cyan-600 text-white border-cyan-600',
  'Sports':        'bg-orange-600 text-white border-orange-600',
  'Life':          'bg-teal-600 text-white border-teal-600',
};

export default function AdminCreatePost({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addNews, user } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title:      '',
    excerpt:    '',
    content:    '',
    categories: ['News'] as Category[],   // multi-select
    imageUrl:   '',
    videoUrl:   '',
    driveUrl:   '',
    isFeatured: false,
    isBreaking: false,
  });

  const set = (key: string, val: unknown) =>
    setFormData(prev => ({ ...prev, [key]: val }));

  const toggleCategory = (cat: Category) => {
    setFormData(prev => {
      const has = prev.categories.includes(cat);
      if (has && prev.categories.length === 1) return prev; // keep at least one
      const next = has
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categories.length === 0) return;
    setSubmitting(true);

    const primaryCategory = formData.categories[0];
    const newPost: NewsItem = {
      id:         Date.now().toString(),
      title:      formData.title,
      excerpt:    formData.excerpt,
      content:    formData.content,
      category:   primaryCategory,
      categories: formData.categories,
      author:     user?.name || 'JM News',
      date:       'Just Now',
      imageUrl:   formData.imageUrl || 'https://picsum.photos/seed/news/800/400',
      videoUrl:   formData.videoUrl || undefined,
      driveUrl:   formData.driveUrl || undefined,
      isFeatured: formData.isFeatured,
      isBreaking: formData.isBreaking,
      tags:       formData.categories, // categories double as tags
    };

    await addNews(newPost);
    setSubmitting(false);
    onClose();
    setFormData({
      title: '', excerpt: '', content: '', categories: ['News'],
      imageUrl: '', videoUrl: '', driveUrl: '',
      isFeatured: false, isBreaking: false,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-[#141414] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#141414] sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-vibrant-primary/10 dark:bg-vibrant-primary/20 rounded-xl">
                <FileText className="w-5 h-5 text-vibrant-primary" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-vibrant-text dark:text-white">
                Create New Post
              </h2>
            </div>
            <button onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-vibrant-primary/10 rounded-full transition-colors text-vibrant-text dark:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="flex flex-col gap-8 max-w-3xl mx-auto">

              {/* Title */}
              <input
                autoFocus required
                placeholder="New post title here..."
                className="text-3xl md:text-5xl font-black bg-transparent border-none focus:ring-0 w-full placeholder:text-gray-300 dark:placeholder:text-white/20 text-vibrant-text dark:text-white"
                value={formData.title}
                onChange={e => set('title', e.target.value)}
              />

              {/* ── Multi-category selector ── */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Categories <span className="text-vibrant-primary">*</span>
                  </label>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {formData.categories.length} selected · click to toggle
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map(cat => {
                    const selected = formData.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${
                          selected ? CAT_SELECTED[cat] : CAT_COLORS[cat]
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Selected summary */}
                {formData.categories.length > 0 && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Primary: <span className="font-bold text-vibrant-primary">{formData.categories[0]}</span>
                    {formData.categories.length > 1 && (
                      <> · Also in: {formData.categories.slice(1).join(', ')}</>
                    )}
                  </p>
                )}
              </div>

              {/* Article Image */}
              <MediaInput
                context="news_image"
                label="Article Image"
                value={formData.imageUrl}
                onChange={url => set('imageUrl', url)}
              />

              {/* Article Video */}
              <MediaInput
                context="news_video"
                label="Article Video (optional)"
                value={formData.videoUrl}
                onChange={url => set('videoUrl', url)}
                placeholder="https://youtube.com/watch?v=... or upload an MP4"
              />

              {/* Sensitive / Drive */}
              <div className="flex flex-col gap-2 p-6 bg-vibrant-primary/5 dark:bg-vibrant-primary/10 rounded-2xl border border-vibrant-primary/10 dark:border-vibrant-primary/30">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-vibrant-primary">
                  <ShieldAlert className="w-3 h-3" /> Highly Sensitive Material (Google Drive)
                </label>
                <input
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-white dark:bg-vibrant-primary/5 border border-vibrant-primary/20 dark:border-vibrant-primary/30 rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30"
                  value={formData.driveUrl}
                  onChange={e => set('driveUrl', e.target.value)}
                />
                <p className="text-[10px] text-gray-400 italic mt-1">
                  Sensitive materials are embedded via secure Google Drive previews.
                </p>
              </div>

              {/* Excerpt */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Short Excerpt</label>
                <textarea required rows={2}
                  placeholder="Summarize the story in a few sentences..."
                  className="w-full bg-gray-50 dark:bg-vibrant-primary/5 border border-gray-100 dark:border-vibrant-primary/20 rounded-2xl p-4 text-sm placeholder:text-gray-400 text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/20"
                  value={formData.excerpt}
                  onChange={e => set('excerpt', e.target.value)}
                />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Article Content</label>
                <textarea required rows={10}
                  placeholder="Write your story here..."
                  className="w-full bg-gray-50 dark:bg-vibrant-primary/5 border border-gray-100 dark:border-vibrant-primary/20 rounded-2xl p-4 text-sm font-serif leading-relaxed placeholder:text-gray-400 text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/20"
                  value={formData.content}
                  onChange={e => set('content', e.target.value)}
                />
              </div>

              {/* Flags */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isFeatured}
                    onChange={e => set('isFeatured', e.target.checked)}
                    className="rounded text-vibrant-primary focus:ring-vibrant-primary" />
                  <span className="text-sm font-bold text-vibrant-text dark:text-white">Feature on Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isBreaking}
                    onChange={e => set('isBreaking', e.target.checked)}
                    className="rounded text-red-500 focus:ring-red-500" />
                  <span className="text-sm font-bold text-vibrant-text dark:text-white flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-red-500" /> Breaking News
                  </span>
                </label>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a] flex justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
              Discard
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="px-8 py-3 bg-vibrant-primary text-white font-black uppercase tracking-widest rounded-full shadow-lg shadow-vibrant-primary/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              <Send className="w-4 h-4" />
              {submitting ? 'Publishing...' : 'Publish Story'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
