import { motion } from 'motion/react';
import { Mail, BarChart3, Globe, Users, Target, Rocket } from 'lucide-react';
import PageNav from '../components/ui/PageNav';
import SeoHead from '../components/seo/SeoHead';

export default function AdvertisePage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-[#0a0a0a] min-h-screen"
    >
      <SeoHead title="Advertise With Us" description="Reach your target audience with JM News. Explore advertising opportunities and sponsorship packages." />
      <PageNav label="Advertise" />
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
      <div className="flex flex-col gap-20">
        <header className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-black uppercase tracking-[0.4em] text-vibrant-primary mb-4 block">Partner with us</span>
          <h1 className="text-4xl md:text-6xl font-black text-vibrant-text tracking-tighter leading-tight italic">
            Reach the Heartland <br /> of Adamawa.
          </h1>
          <p className="text-vibrant-text-light mt-8 text-lg font-medium leading-relaxed">
            Connect your brand with Adamawa's most engaged audience. We offer high-impact digital placements and sponsored content tailored to our region.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Globe, label: "500k+", sub: "Monthly Pageviews" },
            { icon: Users, label: "150k+", sub: "Social Community" },
            { icon: Target, label: "92%", sub: "Regional Retention" }
          ].map((stat, i) => (
            <div key={i} className="bg-vibrant-surface p-8 rounded-vibrant shadow-vibrant text-center flex flex-col items-center border border-gray-100 dark:border-white/5">
              <div className="w-12 h-12 bg-vibrant-primary/10 rounded-full flex items-center justify-center text-vibrant-primary mb-6">
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black text-vibrant-text mb-2 tracking-tighter">{stat.label}</h3>
              <p className="text-[11px] font-black uppercase tracking-widest text-vibrant-text-light">{stat.sub}</p>
            </div>
          ))}
        </section>

        <section className="bg-vibrant-primary rounded-vibrant p-10 md:p-20 text-white shadow-2xl shadow-vibrant-primary/30 relative overflow-hidden">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight tracking-tighter">Ready to start <br /> your campaign?</h2>
              <p className="text-white/80 text-lg mb-8 font-medium">
                Our advertising team will help you craft a strategy that resonates with the JM News audience.
              </p>
              <a 
                href="mailto:advertise@jamila-news.gm" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-vibrant-primary rounded-full font-black text-xs uppercase tracking-widest hover:bg-vibrant-accent hover:text-vibrant-text transition-all transform hover:scale-105 active:scale-95 shadow-xl"
              >
                <Mail className="w-5 h-5" />
                Get Media Kit
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Sponsored Story",
                "Display Banner",
                "Newsletter",
                "Video Feature"
              ].map(opt => (
                <div key={opt} className="p-4 bg-white/10 rounded-xl border border-white/20 font-bold backdrop-blur-sm">
                  {opt}
                </div>
              ))}
            </div>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full border border-white/10"
          />
        </section>
      </div>
    </div>
    </motion.div>
  );
}
