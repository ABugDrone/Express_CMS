import { motion } from 'motion/react';
import PageNav from '../components/ui/PageNav';
import SeoHead from '../components/seo/SeoHead';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support. This includes your name, email address, and any other details you choose to share."
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to deliver, maintain, and improve our services, including providing news updates, personalizing your experience, and responding to your comments and questions."
    },
    {
      title: "3. Information Sharing",
      content: "We do not share your private information with third parties except as required to provide our services (e.g., email delivery via newsletter providers) or if required by law in the Federal Republic of Nigeria."
    },
    {
      title: "4. Cookies & Tracking",
      content: "JM News uses cookies to improve site performance and analyze traffic. You can choose to disable cookies through your browser settings, though this may impact some features of the site."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-[#0a0a0a] min-h-screen"
    >
      <SeoHead title="Privacy Policy" description="JM News privacy policy — how we collect, use, and protect your personal information." />
      <PageNav label="Privacy Policy" />
      <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
      <header className="mb-16 border-b-2 border-amber-600 pb-4">
        <span className="bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-3 inline-block">Legal</span>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Last Updated: April 17, 2026</p>
      </header>
      <div className="flex flex-col gap-10">
        {sections.map((section) => (
          <section key={section.title} className="border-b border-gray-100 dark:border-white/5 pb-8 last:border-0">
            <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-600 inline-block"></span>
              {section.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-loose">{section.content}</p>
          </section>
        ))}
      </div>
      </div>
    </motion.div>
  );
}
