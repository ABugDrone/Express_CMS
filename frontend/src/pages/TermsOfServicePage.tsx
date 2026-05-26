import { motion } from 'motion/react';
import PageNav from '../components/ui/PageNav';
import SeoHead from '../components/seo/SeoHead';

export default function TermsOfServicePage() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using JM News (jmnew.com.ng), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
    },
    {
      title: "2. Intellectual Property",
      content: "All content on JM News, including text, graphics, logos, and images, is the property of Toko Technologies or its content suppliers and is protected by Nigerian and international copyright laws. Reproduction, distribution, or unauthorized use of any material without express written consent is strictly prohibited."
    },
    {
      title: "3. User Conduct",
      content: "Users are prohibited from using the site to post or transmit any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. We reserve the right to remove any content or ban users who violate these guidelines."
    },
    {
      title: "4. Staff Portal & Contributions",
      content: "Access to the Staff Portal is restricted to authorized personnel. Any content posted through administrative accounts remains the intellectual property of JM News. Mock data stored on device cache is for demonstration purposes and may be cleared during system updates."
    },
    {
      title: "5. Disclaimer of Warranties",
      content: "JM News provides news as it unfolds. While we strive for accuracy, we provide our services on an 'as is' and 'as available' basis without any warranties of any kind."
    },
    {
      title: "6. Limitation of Liability",
      content: "Jabbamah Menorah Limited shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our news platform."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-[#0a0a0a] min-h-screen"
    >
      <SeoHead title="Terms of Service" description="JM News terms of service — rules and guidelines for using our news platform." />
      <PageNav label="Terms of Service" />
      <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
      <header className="mb-16 border-b-2 border-amber-600 pb-4">
        <span className="bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 mb-3 inline-block">Legal</span>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Effective Date: April 17, 2026</p>
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
      <footer className="mt-12 pt-6 border-t border-gray-100 dark:border-white/5 text-xs text-gray-400 italic">
        For questions, contact us at legal@jmnew.com.ng
      </footer>
      </div>
    </motion.div>
  );
}
