import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Monitor, User, ChevronDown, ChevronUp, X } from 'lucide-react';
import Logo from '../ui/Logo';

export default function ConsentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('jm_consent_given');
    if (!hasConsented) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = () => {
    localStorage.setItem('jm_consent_given', 'true');
    setIsOpen(false);
  };

  const handleDecline = () => {
    localStorage.setItem('jm_consent_given', 'declined');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-8">
              {/* Logo */}
              <div className="flex justify-center mb-5">
                <Logo />
              </div>

              {/* Headline */}
              <h2 className="text-center text-base font-bold text-gray-800 dark:text-white mb-5 leading-snug">
                jmnews.com.ng asks for your consent to use your personal data to:
              </h2>

              {/* Consent items */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                    Personalised advertising and content, advertising and content measurement, audience research and services development
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Monitor className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                    Store and/or access information on a device
                  </p>
                </div>

                {/* Learn more toggle */}
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center shrink-0 group-hover:border-amber-500 transition-colors">
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-amber-600 transition-colors">
                    Learn more
                  </span>
                </button>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 space-y-3">
                      <p>
                        Your personal data will be processed and information from your device (cookies, unique identifiers, and other device data) may be stored by, accessed by and shared with our partners, or used specifically by this site.
                      </p>
                      <p>
                        Some vendors may process your personal data on the basis of legitimate interest, which you can object to by managing your options below. See our{' '}
                        <Link to="/privacy" onClick={() => setIsOpen(false)} className="text-amber-600 underline">Privacy Policy</Link>
                        {' '}and{' '}
                        <Link to="/tos" onClick={() => setIsOpen(false)} className="text-amber-600 underline">Terms of Service</Link>.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="border-t border-gray-100 dark:border-white/10 pt-4 mt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setManageOpen(!manageOpen)}
                  className="flex-1 py-3 border-2 border-amber-600 text-amber-600 dark:text-amber-500 text-sm font-black uppercase tracking-widest rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                >
                  Manage options
                </button>
                <button
                  onClick={handleConsent}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-black uppercase tracking-widest rounded-full transition-colors shadow-lg shadow-amber-600/20"
                >
                  Consent
                </button>
              </div>

              {/* Manage options panel */}
              <AnimatePresence>
                {manageOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 flex flex-col gap-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Choose what data you allow us to use:</p>
                      {['Personalised Ads', 'Analytics & Research', 'Device Storage'].map(opt => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" defaultChecked className="accent-amber-600 w-4 h-4" />
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{opt}</span>
                        </label>
                      ))}
                      <button
                        onClick={handleDecline}
                        className="mt-3 text-xs text-gray-400 hover:text-red-500 transition-colors underline text-left"
                      >
                        Decline all & continue with limited experience
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
