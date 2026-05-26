import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Linkedin, Twitter } from 'lucide-react';
import PageNav from '../components/ui/PageNav';
import { JournalistProfile } from '../types';
import { apiGetJournalists } from '../lib/api';
import SeoHead from '../components/seo/SeoHead';

// ── Static fallback team (shown when no journalist profiles have been saved) ──
const FALLBACK_TEAM: JournalistProfile[] = [
  {
    display_name: 'Yusuf Abubakar',
    role_label:   'Editor-in-Chief',
    bio:          'With over 15 years in regional journalism, Yusuf leads our editorial board with a commitment to local investigative reporting.',
    avatar_url:   'https://picsum.photos/seed/yusuf/400/500',
    twitter_url:  '',
    linkedin_url: '',
  },
  {
    display_name: 'Zainab Bello',
    role_label:   'Legal & Regulatory Head',
    bio:          'Managing director of Toko Technologies, overseeing legal compliance and high-level strategy for our independent voice.',
    avatar_url:   'https://picsum.photos/seed/zainab/400/500',
    twitter_url:  '',
    linkedin_url: '',
  },
  {
    display_name: 'Musa Ibrahim',
    role_label:   'Political Correspondent',
    bio:          'Expert in Adamawa politics, Musa provides deep insights into state assembly debates and political movements.',
    avatar_url:   'https://picsum.photos/seed/musa/400/500',
    twitter_url:  '',
    linkedin_url: '',
  },
  {
    display_name: 'Amina Yusuf',
    role_label:   'Head of Digital Strategy',
    bio:          'Driving our digital expansion and social media news delivery, Amina ensures JM News reaches our global community.',
    avatar_url:   'https://picsum.photos/seed/amina/400/500',
    twitter_url:  '',
    linkedin_url: '',
  },
];

function loadJournalists(): JournalistProfile[] {
  try {
    const raw = localStorage.getItem('jm_journalist_profiles');
    if (!raw) return FALLBACK_TEAM;
    const parsed: JournalistProfile[] = JSON.parse(raw);
    // If no profiles have been filled in yet, show fallback
    return parsed.length > 0 ? parsed : FALLBACK_TEAM;
  } catch {
    return FALLBACK_TEAM;
  }
}

export default function OurTeamPage() {
  const [team, setTeam] = useState<JournalistProfile[]>(FALLBACK_TEAM);

  useEffect(() => {
    // Try backend first, fall back to localStorage, then static fallback
    apiGetJournalists()
      .then(data => { if (data.length > 0) setTeam(data); })
      .catch(() => {
        const local = loadJournalists();
        if (local !== FALLBACK_TEAM) setTeam(local);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-[#0a0a0a] min-h-screen"
    >
      <SeoHead title="Our Team" description="Meet the dedicated journalists and staff behind JM News — delivering factual and timely news to Adamawa State." />
      <PageNav label="Our Team" />
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <header className="max-w-3xl mb-16 lg:mb-24">
          <span className="text-xs font-black uppercase tracking-[0.4em] text-vibrant-primary mb-4 block underline">
            The Newsroom
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-vibrant-text dark:text-white tracking-tighter leading-tight italic">
            Meet the Minds Behind <br /> the Headlines.
          </h1>
          <p className="text-vibrant-text-light dark:text-gray-400 mt-8 text-lg font-medium leading-relaxed">
            A dedicated collective of journalists, researchers, and strategists working around the clock to bring you the Adamawa perspective.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={`${member.display_name}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-vibrant shadow-xl mb-6 relative bg-gray-100 dark:bg-white/5">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.display_name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-black text-vibrant-primary/30 uppercase">
                      {member.display_name[0]}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-vibrant-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vibrant-primary">
                  {member.role_label}
                </span>
                <h3 className="text-xl font-black text-vibrant-text dark:text-white uppercase tracking-tight">
                  {member.display_name}
                </h3>
                {member.bio && (
                  <p className="text-sm text-vibrant-text-light dark:text-gray-400 leading-relaxed mb-4">
                    {member.bio}
                  </p>
                )}
                <div className="flex gap-4">
                  {member.twitter_url && (
                    <a href={member.twitter_url} target="_blank" rel="noopener noreferrer"
                      className="text-gray-400 hover:text-vibrant-primary transition-colors">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {member.linkedin_url && (
                    <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="text-gray-400 hover:text-vibrant-primary transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  <a href="#" className="text-gray-400 hover:text-vibrant-primary transition-colors">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
