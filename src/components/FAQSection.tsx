import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircle } from '../icons';
import { FAQ } from '../types';

interface FAQSectionProps {
  faqs: FAQ[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [openId, setOpenId] = React.useState<string | null>(null);

  const categories = Array.from(new Set(faqs.map(f => f.category)));

  return (
    <section id="faqs" className="py-32 bg-white dark:bg-black/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-20">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-widest uppercase">
            <MessageCircle size={16} />
            <span>Common Questions</span>
          </div>
          <h2 className="text-5xl font-serif italic font-semibold text-dark">Everything you need to know</h2>
          <p className="text-muted max-w-xl mx-auto">
            Find quick answers about our ordering process, delivery zones, and dietary options.
          </p>
        </div>

        <div className="space-y-12">
          {categories.map(category => (
            <div key={category} className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-primary/60 ml-4">{category}</h3>
              <div className="space-y-4">
                {faqs.filter(f => f.category === category).map((faq) => (
                  <div 
                    key={faq.id}
                    className="group rounded-[2rem] border border-border bg-bg/30 dark:bg-white/5 overflow-hidden transition-all hover:border-primary/30"
                  >
                    <button
                      onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                      className="w-full px-8 py-6 flex items-center justify-between text-left"
                    >
                      <span className="text-lg font-bold text-dark group-hover:text-primary transition-colors">
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{ rotate: openId === faq.id ? 180 : 0 }}
                        className="text-muted"
                      >
                        <ChevronDown size={20} />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {openId === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <div className="px-8 pb-8 text-muted leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
