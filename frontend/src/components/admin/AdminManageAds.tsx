import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Link as LinkIcon, Calendar, DollarSign, Code, Trash2, Edit2, Plus, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Advertisement } from '../../types';
import MediaInput from '../ui/MediaInput';

// ── Full spec reference ───────────────────────────────────────────────────────

const PLACEMENT_SPECS = [
  {
    name: 'Top Banner',
    key: 'top',
    sizes: [
      { device: 'Desktop', px: '1200 × 250 px', ratio: '4.8 : 1' },
      { device: 'Tablet',  px: '728 × 90 px',   ratio: '8.1 : 1' },
      { device: 'Mobile',  px: '320 × 50 px',   ratio: '6.4 : 1' },
    ],
    imageFormats: 'JPG · PNG · WebP · AVIF · GIF (animated)',
    videoFormats: 'MP4 · WebM',
    maxImage: '10 MB',
    maxVideo: '200 MB',
  },
  {
    name: 'Left Sidebar',
    key: 'left',
    sizes: [
      { device: 'Desktop', px: '160 × 600 px', ratio: '0.27 : 1' },
      { device: 'Tablet',  px: '120 × 600 px', ratio: '0.2 : 1' },
    ],
    imageFormats: 'JPG · PNG · WebP · AVIF · GIF (animated)',
    videoFormats: '—',
    maxImage: '10 MB',
    maxVideo: '—',
  },
  {
    name: 'Right Sidebar',
    key: 'right',
    sizes: [
      { device: 'Desktop', px: '300 × 600 px', ratio: '0.5 : 1' },
      { device: 'Tablet',  px: '300 × 250 px', ratio: '1.2 : 1' },
    ],
    imageFormats: 'JPG · PNG · WebP · AVIF · GIF (animated)',
    videoFormats: '—',
    maxImage: '10 MB',
    maxVideo: '—',
  },
  {
    name: 'Middle Strip',
    key: 'middle',
    sizes: [
      { device: 'Desktop', px: '728 × 90 px',  ratio: '8.1 : 1' },
      { device: 'Mobile',  px: '300 × 250 px', ratio: '1.2 : 1' },
    ],
    imageFormats: 'JPG · PNG · WebP · AVIF · GIF (animated)',
    videoFormats: 'MP4 · WebM',
    maxImage: '10 MB',
    maxVideo: '200 MB',
  },
];

export default function AdminManageAds({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { ads, addAd, updateAd, deleteAd } = useAppContext();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);
  const [formData, setFormData] = useState<Partial<Advertisement>>({
    title: '',
    imageUrl: '',
    bannerUrl: '',
    videoUrl: '',
    videoFile: '',
    redirectUrl: '',
    placement: 'top',
    type: 'static_image',
    isPaid: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    adsenseCode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.placement) {
      alert('Please fill in required fields');
      return;
    }

    if (editingId) {
      updateAd(editingId, formData);
      setEditingId(null);
    } else {
      const newAd: Advertisement = {
        id: Date.now().toString(),
        title: formData.title || '',
        imageUrl: formData.imageUrl,
        bannerUrl: formData.bannerUrl,
        videoUrl: formData.videoUrl,
        videoFile: formData.videoFile,
        redirectUrl: formData.redirectUrl || '',
        placement: formData.placement as Advertisement['placement'],
        type: formData.type as Advertisement['type'],
        isPaid: formData.isPaid || false,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: formData.isActive !== false,
        createdAt: new Date().toISOString(),
        adsenseCode: formData.adsenseCode
      };
      addAd(newAd);
    }

    resetForm();
    setIsAddingNew(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      bannerUrl: '',
      videoUrl: '',
      videoFile: '',
      redirectUrl: '',
      placement: 'top',
      type: 'static_image',
      isPaid: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      adsenseCode: ''
    });
    setEditingId(null);
  };

  const handleEdit = (ad: Advertisement) => {
    setFormData(ad);
    setEditingId(ad.id);
    setIsAddingNew(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      deleteAd(id);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-white dark:bg-[#141414] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#141414] sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-vibrant-primary/10 dark:bg-vibrant-primary/20 rounded-xl">
                <ImageIcon className="w-5 h-5 text-vibrant-primary" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-vibrant-text dark:text-vibrant-text">Manage Ads & Banners</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSpecs(!showSpecs)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-vibrant-primary/10 rounded-full transition-colors text-vibrant-primary"
                title="View size specifications"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-vibrant-primary/10 rounded-full transition-colors text-vibrant-text dark:text-vibrant-text"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="flex flex-col gap-8 max-w-4xl mx-auto">
              
              {/* Spec Panel */}
              {showSpecs && (
                <div className="bg-vibrant-accent/10 border-2 border-vibrant-accent p-6 rounded-2xl mb-6">
                  <h3 className="text-lg font-black uppercase tracking-tight mb-6 text-vibrant-accent">📐 Ad Specifications</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {PLACEMENT_SPECS.map(spec => (
                      <div key={spec.key} className="bg-white dark:bg-vibrant-primary/5 p-4 rounded-xl border border-vibrant-accent/20">
                        <h4 className="font-black text-vibrant-text dark:text-white mb-3 text-sm">{spec.name}</h4>
                        <div className="space-y-1.5 text-xs">
                          {spec.sizes.map((s, i) => (
                            <div key={i} className="flex justify-between text-gray-500 dark:text-gray-400">
                              <span>{s.device}</span>
                              <span className="font-mono font-bold">{s.px} ({s.ratio})</span>
                            </div>
                          ))}
                          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-white/10 space-y-1">
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                              <span>Image formats</span>
                              <span className="font-bold text-right max-w-[55%]">{spec.imageFormats}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                              <span>Video formats</span>
                              <span className="font-bold">{spec.videoFormats}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                              <span>Max image</span>
                              <span className="font-bold">{spec.maxImage}</span>
                            </div>
                            {spec.maxVideo !== '—' && (
                              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                <span>Max video</span>
                                <span className="font-bold">{spec.maxVideo}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white dark:bg-vibrant-primary/5 p-4 rounded-xl border border-vibrant-accent/20 text-xs space-y-2">
                    <h4 className="font-black text-vibrant-text dark:text-white mb-2">🎬 Video Embed (YouTube / Vimeo)</h4>
                    <p className="text-gray-500 dark:text-gray-400">Use the embed URL format: <span className="font-mono">youtube.com/embed/VIDEO_ID</span></p>
                    <p className="text-gray-500 dark:text-gray-400">Aspect ratio: <strong>16:9</strong> · Responsive (auto-scales to slot)</p>
                    <p className="text-gray-500 dark:text-gray-400">Uploaded MP4/WebM: H.264 + AAC · Max 60 s recommended · 1920×1080 preferred</p>
                  </div>
                </div>
              )}
              
              {/* Add New Ad Button */}
              {!isAddingNew && (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="w-full py-4 border-2 border-dashed border-vibrant-primary/30 rounded-2xl hover:border-vibrant-primary hover:bg-vibrant-primary/5 transition-all flex items-center justify-center gap-2 text-vibrant-primary font-bold uppercase tracking-widest"
                >
                  <Plus className="w-5 h-5" />
                  Add New Advertisement
                </button>
              )}

              {/* Add/Edit Form */}
              {isAddingNew && (
                <form onSubmit={handleSubmit} className="bg-vibrant-primary/5 dark:bg-vibrant-primary/10 p-8 rounded-2xl border border-vibrant-primary/20 dark:border-vibrant-primary/30">
                  <h3 className="text-lg font-black uppercase tracking-tight mb-6 text-vibrant-text dark:text-vibrant-text">
                    {editingId ? 'Edit Advertisement' : 'Create New Advertisement'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Title */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-vibrant-text-light/60">Ad Title *</label>
                      <input 
                        required
                        placeholder="e.g., Summer Sale Campaign"
                        className="w-full bg-white dark:bg-vibrant-primary/5 border border-gray-100 dark:border-vibrant-primary/20 rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-vibrant-text-light/40 text-vibrant-text dark:text-vibrant-text"
                        value={formData.title || ''}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    {/* Placement */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-vibrant-text-light/60">Placement *</label>
                      <select 
                        className="w-full bg-white dark:bg-vibrant-primary/5 border border-gray-100 dark:border-vibrant-primary/20 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-vibrant-text appearance-none cursor-pointer"
                        value={formData.placement || 'top'}
                        onChange={e => setFormData(prev => ({ ...prev, placement: e.target.value as Advertisement['placement'] }))}
                      >
                        <option value="top">Top Banner (1200×250px)</option>
                        <option value="left">Left Sidebar (160×600px)</option>
                        <option value="right">Right Sidebar (300×600px)</option>
                        <option value="middle">Middle Section (728×90px)</option>
                      </select>
                    </div>

                    {/* Ad Type */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-vibrant-text-light/60">Ad Type *</label>
                      <select 
                        className="w-full bg-white dark:bg-vibrant-primary/5 border border-gray-100 dark:border-vibrant-primary/20 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-vibrant-text appearance-none cursor-pointer"
                        value={formData.type || 'static_image'}
                        onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as Advertisement['type'] }))}
                      >
                        <option value="static_image">Static Image (JPG/PNG)</option>
                        <option value="animated_banner">Animated Banner (GIF)</option>
                        <option value="video">Video Ad (YouTube/MP4)</option>
                        <option value="adsense">Google AdSense</option>
                      </select>
                    </div>

                    {/* Paid Status */}
                    <div className="flex items-end gap-2">
                      <input 
                        type="checkbox"
                        id="isPaid"
                        className="rounded text-vibrant-primary focus:ring-vibrant-primary dark:bg-vibrant-primary/10 dark:border-vibrant-primary/30"
                        checked={formData.isPaid || false}
                        onChange={e => setFormData(prev => ({ ...prev, isPaid: e.target.checked }))}
                      />
                      <label htmlFor="isPaid" className="text-sm font-bold text-vibrant-text dark:text-vibrant-text flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Paid Advertisement
                      </label>
                    </div>
                  </div>

                  {/* Static Image */}
                  {formData.type === 'static_image' && (
                    <div className="mb-6">
                      <MediaInput
                        context="ad_image"
                        label="Ad Image (JPG · PNG · WebP · AVIF)"
                        value={formData.imageUrl || ''}
                        onChange={url => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      />
                    </div>
                  )}

                  {/* Animated Banner */}
                  {formData.type === 'animated_banner' && (
                    <div className="mb-6">
                      <MediaInput
                        context="ad_image"
                        label="Animated Banner (GIF · WebP · AVIF)"
                        value={formData.bannerUrl || ''}
                        onChange={url => setFormData(prev => ({ ...prev, bannerUrl: url }))}
                        placeholder="https://example.com/banner.gif"
                      />
                    </div>
                  )}

                  {/* Video Ad */}
                  {formData.type === 'video' && (
                    <div className="flex flex-col gap-4 mb-6">
                      <div className="flex flex-col gap-2 p-4 bg-white dark:bg-vibrant-primary/5 rounded-xl border border-vibrant-primary/20">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">YouTube / Vimeo Embed URL</label>
                        <input
                          placeholder="https://www.youtube.com/embed/VIDEO_ID"
                          className="w-full bg-gray-50 dark:bg-vibrant-primary/5 border border-gray-100 dark:border-vibrant-primary/20 rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 text-vibrant-text dark:text-white focus:outline-none focus:ring-2 focus:ring-vibrant-primary/30"
                          value={formData.videoUrl || ''}
                          onChange={e => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                        />
                        <p className="text-[10px] text-gray-400">Embed URL format · 16:9 aspect ratio · Responsive</p>
                      </div>
                      <MediaInput
                        context="ad_video"
                        label="Or upload MP4 / WebM directly"
                        value={formData.videoFile || ''}
                        onChange={url => setFormData(prev => ({ ...prev, videoFile: url }))}
                      />
                    </div>
                  )}

                  {/* AdSense Code */}
                  {formData.type === 'adsense' && (
                    <div className="flex flex-col gap-2 mb-6 p-4 bg-white dark:bg-vibrant-primary/5 rounded-xl border border-vibrant-primary/20">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-vibrant-text-light/60">
                        <Code className="w-3 h-3" /> Google AdSense Code
                      </label>
                      <textarea 
                        placeholder="Paste your Google AdSense code here..."
                        rows={4}
                        className="w-full bg-white dark:bg-vibrant-primary/5 border border-gray-100 dark:border-vibrant-primary/20 rounded-xl px-4 py-3 text-sm font-mono placeholder:text-gray-400 dark:placeholder:text-vibrant-text-light/40 text-vibrant-text dark:text-vibrant-text"
                        value={formData.adsenseCode || ''}
                        onChange={e => setFormData(prev => ({ ...prev, adsenseCode: e.target.value }))}
                      />
                      <p className="text-[10px] text-vibrant-text-light dark:text-vibrant-text-light/60">Paste the complete script tag from your AdSense account</p>
                    </div>
                  )}

                  {/* Redirect URL */}
                  <div className="flex flex-col gap-2 mb-6">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-vibrant-text-light/60">
                      <LinkIcon className="w-3 h-3" /> Redirect URL (Click Destination)
                    </label>
                    <input 
                      placeholder="https://example.com"
                      className="w-full bg-white dark:bg-vibrant-primary/5 border border-gray-100 dark:border-vibrant-primary/20 rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-vibrant-text-light/40 text-vibrant-text dark:text-vibrant-text"
                      value={formData.redirectUrl || ''}
                      onChange={e => setFormData(prev => ({ ...prev, redirectUrl: e.target.value }))}
                    />
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-vibrant-text-light/60">
                        <Calendar className="w-3 h-3" /> Start Date
                      </label>
                      <input 
                        type="date"
                        className="w-full bg-white dark:bg-vibrant-primary/5 border border-gray-100 dark:border-vibrant-primary/20 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-vibrant-text"
                        value={formData.startDate || ''}
                        onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-vibrant-text-light/60">
                        <Calendar className="w-3 h-3" /> End Date
                      </label>
                      <input 
                        type="date"
                        className="w-full bg-white dark:bg-vibrant-primary/5 border border-gray-100 dark:border-vibrant-primary/20 rounded-xl px-4 py-3 text-sm text-vibrant-text dark:text-vibrant-text"
                        value={formData.endDate || ''}
                        onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-2 mb-6">
                    <input 
                      type="checkbox"
                      id="isActive"
                      className="rounded text-vibrant-primary focus:ring-vibrant-primary dark:bg-vibrant-primary/10 dark:border-vibrant-primary/30"
                      checked={formData.isActive !== false}
                      onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-vibrant-text dark:text-vibrant-text">Active</label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 justify-end">
                    <button 
                      type="button"
                      onClick={() => {
                        resetForm();
                        setIsAddingNew(false);
                      }}
                      className="px-6 py-3 text-sm font-bold text-vibrant-text-light dark:text-vibrant-text-light hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-8 py-3 bg-vibrant-primary text-white font-black uppercase tracking-widest rounded-full shadow-lg shadow-vibrant-primary/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                    >
                      {editingId ? 'Update Ad' : 'Create Ad'}
                    </button>
                  </div>
                </form>
              )}

              {/* Ads List */}
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-black uppercase tracking-tight text-vibrant-text dark:text-vibrant-text">Active Advertisements ({ads.length})</h3>
                
                {ads.length === 0 ? (
                  <div className="text-center py-12 text-vibrant-text-light dark:text-vibrant-text-light/60">
                    <p className="text-sm font-bold">No advertisements yet. Create one to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {ads.map((ad) => (
                      <div key={ad.id} className="bg-vibrant-primary/5 dark:bg-vibrant-primary/10 border border-vibrant-primary/20 dark:border-vibrant-primary/30 rounded-xl p-6 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-base font-black text-vibrant-text dark:text-vibrant-text">{ad.title}</h4>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {ad.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {ad.isPaid && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-vibrant-primary/20 text-vibrant-primary">Paid</span>}
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs font-bold text-vibrant-text-light dark:text-vibrant-text-light/60">
                            <span>📍 {ad.placement}</span>
                            <span>🏷️ {ad.type.replace('_', ' ')}</span>
                            <span>📅 {ad.startDate} to {ad.endDate}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button 
                            onClick={() => handleEdit(ad)}
                            className="p-2 hover:bg-vibrant-primary/20 rounded-lg transition-colors text-vibrant-primary"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(ad.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
