import React from 'react';
import { Sparkles, UserIcon } from '../icons';
import { motion } from 'motion/react';

export const About: React.FC = () => {
  const stats = [
    { label: "Cakes Made", value: "500+" },
    { label: "Years Exp", value: "8+" },
    { label: "Avg Rating", value: "4.9★" }
  ];

  return (
    <section id="about" className="py-24 bg-bg relative overflow-hidden">
      <div className="noise" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Column */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-surface transform transition-transform duration-1000 hover:scale-[1.02]">
              <img
                src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80&w=800"
                alt="Sarah in professional chef uniform"
                className="w-full h-full object-cover animate-fade-in"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Baker Extraordinaire Icon */}
            <div className="absolute -top-6 -left-6 bg-accent p-4 rounded-2xl shadow-xl border-4 border-white dark:border-surface flex items-center space-x-3 animate-float">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                <UserIcon size={20} />
              </div>
              <span className="text-white font-bold uppercase tracking-widest text-[10px]">Baker Extraordinaire</span>
            </div>
            {/* Floating element */}
            <div className="absolute -bottom-10 -right-10 bg-primary p-8 rounded-[2rem] text-white shadow-2xl hidden md:block max-w-xs transform translate-y-4 opacity-0 animate-[slide-down-reveal_1s_ease-out_forwards]">
              <p className="font-serif italic text-xl leading-snug">
                "Baking is my love language. Every crumb is a testament to the joy of celebration."
              </p>
              <p className="mt-4 text-sm font-bold uppercase tracking-widest opacity-80">— Sarah</p>
            </div>
          </motion.div>

          {/* Text Column */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-sm">The Founder</span>
              <h2 className="text-5xl md:text-7xl font-serif italic font-semibold text-dark">Meet Sarah</h2>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 text-muted text-lg leading-relaxed"
            >
              <p>
                My journey began in my grandmother's kitchen, where I first learned that a cake is more than just flour and sugar—it's the heart of a memory.
              </p>
              <p>
                After years of training in Paris and London, I returned home to create Sweet Moments. My philosophy is simple: use the best ingredients, respect the craft, and never stop dreaming in buttercream.
              </p>
              <p>
                Today, I lead a small team of dedicated artisans who share my passion for perfection. We don't just bake; we curate experiences that linger long after the last slice is gone.
              </p>
            </motion.div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              {stats.map((stat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + (idx * 0.1) }}
                  className="text-center"
                >
                  <span className="block text-3xl font-serif italic font-bold text-primary">{stat.value}</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted font-bold">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
