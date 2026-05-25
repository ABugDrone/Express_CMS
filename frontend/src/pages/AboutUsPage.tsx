import { motion } from 'motion/react';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import PageNav from '../components/ui/PageNav';
import SeoHead from '../components/seo/SeoHead';

export default function AboutUsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <SeoHead title="About Us" description="Learn about JM News — our mission, vision, and commitment to delivering factual and timely news to Adamawa State and beyond." />
      <PageNav label="About Us" />
      <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
      <div className="flex flex-col gap-12">
        <header className="text-center">
          <span className="text-xs font-black uppercase tracking-[0.4em] text-vibrant-primary mb-4 block">Our Story</span>
          <h1 className="text-4xl md:text-6xl font-black text-vibrant-text tracking-tighter leading-tight italic">
            "About JM News"
          </h1>
          <p className="text-vibrant-text-light mt-8 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Jabbamah Menorah News was founded with a singular purpose: to bridge the information gap in Northern Nigeria through fearless, factual, and timely journalism.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-12 mt-12">
          <div className="bg-vibrant-surface p-8 rounded-vibrant shadow-vibrant border-l-4 border-vibrant-primary">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-vibrant-text">The Mission</h3>
            <p className="text-vibrant-text-light text-sm leading-loose">
              To empower the local community with news that matters, from deep-dive political analysis to regional updates that impact daily lives. We believe in journalism that holds power accountable while celebrating the cultural richness of our region.
            </p>
          </div>
          <div className="bg-vibrant-surface p-8 rounded-vibrant shadow-vibrant border-l-4 border-vibrant-accent">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-vibrant-text">The Vision</h3>
            <p className="text-vibrant-text-light text-sm leading-loose">
              To become the most trusted digital news ecosystem in Adamawa State and across Nigeria, evolving with technology to deliver news where people are, when it happens.
            </p>
          </div>
        </section>

        <section className="bg-vibrant-neutral-dark text-white p-10 md:p-16 rounded-vibrant overflow-hidden relative">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black mb-6 uppercase tracking-tight">Our Core Values</h2>
              <div className="space-y-4">
                {[
                  "Unwavering Integrity",
                  "Factual Accuracy",
                  "Cultural Respect",
                  "Innovation First",
                  "Community Centric"
                ].map((value) => (
                  <div key={value} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-vibrant-primary" />
                    <span className="font-bold tracking-wide">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-white/60 text-sm italic leading-relaxed">
              "We don't just report the news; we record history as it unfolds in our state. Our dedication to local perspectives is what makes JM News different."
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-vibrant-primary/20 blur-3xl -mr-32 -mt-32 rounded-full" />
        </section>
      </div>
    </div>
    </motion.div>
  );
}
