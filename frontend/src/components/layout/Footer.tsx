import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Logo from '../ui/Logo';
import { memo, useState, useEffect } from 'react';
import { apiGetSocials, apiGetQuickLinks, apiGetContactInfo, apiGetSiteSettings } from '../../lib/api';
import { useThemeComponents } from '../../themes/useTheme';

function Footer() {
  const { isAdmin, isStaff, logout } = useAppContext();
  const [socials, setSocials] = useState<{ platform: string; url: string }[]>([]);
  const [quickLinks, setQuickLinks] = useState<{ label: string; url: string }[]>([]);
  const [contactInfo, setContactInfo] = useState<{ type: string; value: string }[]>([]);
  const [copyright, setCopyright] = useState('');
  const cfg = useThemeComponents()?.footer;
  const footerStyle = cfg?.style || 'multi-column';

  useEffect(() => {
    apiGetSocials().then(links => setSocials(links.map(l => ({ platform: l.platform, url: l.url })))).catch(() => {});
    apiGetQuickLinks('footer').then(links => setQuickLinks(links.map(l => ({ label: l.label, url: l.url })))).catch(() => {});
    apiGetContactInfo().then(info => setContactInfo(info.map(c => ({ type: c.type, value: c.value })))).catch(() => {});
    apiGetSiteSettings().then(s => {
      if (s.footer_copyright) setCopyright(s.footer_copyright.value);
    }).catch(() => {});
  }, []);

  const socialIcon = (platform: string, className = 'w-5 h-5') => {
    const p = platform.toLowerCase();
    if (p === 'facebook') return <Facebook className={className} />;
    if (p === 'twitter' || p === 'x') return <Twitter className={className} />;
    if (p === 'instagram') return <Instagram className={className} />;
    if (p === 'youtube') return <Youtube className={className} />;
    return <span className={`${className} flex items-center justify-center text-xs font-bold uppercase`}>{platform[0]}</span>;
  };

  const contactIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'email') return <Mail className="w-4 h-4 text-gray-500 shrink-0" />;
    if (t === 'phone') return <Phone className="w-4 h-4 text-gray-500 shrink-0" />;
    if (t === 'address') return <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />;
    return null;
  };

  const adminPortals = (
    <li>
      {isAdmin ? (
        <div className="flex flex-col gap-0.5">
          <span className="text-vibrant-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-vibrant-primary rounded-full animate-pulse inline-block" />
            Admin Active
          </span>
          <Link to="/admin" className="text-vibrant-primary hover:text-vibrant-primary/80 transition-colors font-bold">→ Admin Portal</Link>
          <button onClick={logout} className="text-left text-red-500/50 hover:text-red-400 transition-colors text-xs">Sign out</button>
        </div>
      ) : (
        <Link to="/admin" className="hover:text-white transition-colors">Admin Portal</Link>
      )}
    </li>
  );

  const staffPortals = (
    <li>
      {isStaff ? (
        <div className="flex flex-col gap-0.5">
          <span className="text-amber-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse inline-block" />
            Staff Active
          </span>
          <Link to="/admin" className="text-amber-500 hover:text-amber-400 transition-colors font-bold">→ Staff Portal</Link>
          <button onClick={logout} className="text-left text-red-500/50 hover:text-red-400 transition-colors text-xs">Sign out</button>
        </div>
      ) : (
        <Link to="/admin" className="hover:text-white transition-colors">Staff Portal</Link>
      )}
    </li>
  );

  const legalSection = (
    <div className="flex flex-col gap-6">
      <h4 className="text-xs font-black uppercase tracking-[0.2em]">Legal</h4>
      <div className="bg-white/5 p-6 border border-white/10">
        <p className="text-[11px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold mb-4">Jabbamah Menorah Ltd</p>
        <p className="text-xs text-gray-300 leading-relaxed italic">"We deliver factual and timely news."</p>
      </div>
    </div>
  );

  const bottomBar = (
    <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-600">
      <div>{copyright || '© 2026 Jabbamah Menorah Limited. All rights reserved.'}</div>
      <div className="flex gap-6">
        {quickLinks.filter(l => l.url.startsWith('/privacy') || l.url.startsWith('/tos') || l.url.startsWith('#')).map(l => (
          l.url.startsWith('/') ? (
            <Link key={l.label} to={l.url} className="hover:text-white transition-colors">{l.label}</Link>
          ) : (
            <a key={l.label} href={l.url} className="hover:text-white transition-colors">{l.label}</a>
          )
        ))}
      </div>
    </div>
  );

  if (footerStyle === 'minimal') {
    return (
      <footer className="bg-black text-white py-8 px-6 text-center">
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{copyright || '© 2026 Jabbamah Menorah Limited. All rights reserved.'}</p>
      </footer>
    );
  }

  if (footerStyle === 'centered') {
    return (
      <footer className="bg-black text-white pt-12 pb-8 px-6 text-center">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-6">
          <Logo variant="light" />
          <p className="text-gray-400 text-sm leading-relaxed">Adamawa's independent voice for news, politics, and culture.</p>
          {cfg?.showSocial !== false && socials.length > 0 && (
            <div className="flex gap-4">
              {socials.map(s => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                  <span className="group-hover:text-vibrant-accent transition-colors">{socialIcon(s.platform)}</span>
                </a>
              ))}
            </div>
          )}
          <div className="flex gap-4 text-xs text-gray-400">
            {adminPortals}
            {staffPortals}
          </div>
        </div>
        {bottomBar}
      </footer>
    );
  }

  if (footerStyle === 'simple') {
    return (
      <footer className="bg-black text-white pt-12 pb-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo variant="light" />
          <div className="flex gap-4 text-xs text-gray-400">
            {adminPortals}
            {staffPortals}
          </div>
          {cfg?.showSocial !== false && socials.length > 0 && (
            <div className="flex gap-3">
              {socials.map(s => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white transition-colors">
                  {socialIcon(s.platform, 'w-4 h-4')}
                </a>
              ))}
            </div>
          )}
        </div>
        {bottomBar}
      </footer>
    );
  }

  // multi-column (default)
  return (
    <footer className="bg-black text-white pt-16 pb-8 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">

        {/* Brand */}
        <div className="flex flex-col gap-6">
          <Logo variant="light" className="items-start" />
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mt-4">
            Adamawa's independent voice for news, politics, and culture. We deliver factual and timely news to our global community.
          </p>
          {cfg?.showSocial !== false && (
            <div className="flex gap-4">
              {socials.map(s => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                  <span className="group-hover:text-vibrant-accent transition-colors">{socialIcon(s.platform)}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        {cfg?.showQuickLinks !== false && (
          <div className="flex flex-col gap-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Quick Links</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              {quickLinks.map(l => (
                <li key={l.label}>
                  {l.url.startsWith('/') ? (
                    <Link to={l.url} className="hover:text-white transition-colors">{l.label}</Link>
                  ) : (
                    <a href={l.url} className="hover:text-white transition-colors">{l.label}</a>
                  )}
                </li>
              ))}
              {adminPortals}
              {staffPortals}
            </ul>
          </div>
        )}

        {/* Contact */}
        <div id="contact" className="flex flex-col gap-6 scroll-mt-24">
          <h4 className="text-xs font-black uppercase tracking-[0.2em]">Contact Us</h4>
          <ul className="flex flex-col gap-4 text-sm text-gray-400">
            {contactInfo.map(c => (
              <li key={c.type} className="flex items-center gap-3">
                {contactIcon(c.type)}
                {c.type === 'email' ? (
                  <a href={`mailto:${c.value}`} className="hover:text-white transition-colors">{c.value}</a>
                ) : (
                  <span>{c.value}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        {cfg?.showLegal !== false && legalSection}
      </div>

      {bottomBar}
    </footer>
  );
}

export default memo(Footer);
