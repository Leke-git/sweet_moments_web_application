import React from 'react';
import { ArrowRight, Sparkles } from '../icons';

interface HeroProps {
  onOpenOrder: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenOrder }) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="noise" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8 z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold tracking-wide uppercase">
            <Sparkles size={16} />
            <span>Artisan Bakery</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif italic font-semibold text-dark leading-[0.9] tracking-tight">
            Cakes as unique <br />
            <span className="text-primary">as your story</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted max-w-xl leading-relaxed">
            Bespoke, hand-crafted creations that blend contemporary design with timeless flavour. 
            Every cake is a masterpiece designed specifically for your most cherished moments.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
            <button
              onClick={onOpenOrder}
              className="bg-primary text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 group"
            >
              <span>Order Your Cake</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a
              href="#gallery"
              className="bg-white/50 dark:bg-white/5 border border-border px-10 py-4 rounded-full text-lg font-semibold hover:bg-white dark:hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Explore Our Work
            </a>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          <div className="relative w-full aspect-square max-w-md animate-float">
            {/* Decorative shapes */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-surface transform rotate-3">
              <img
                src="https://images.unsplash.com/photo-1535254973040-607b474cb80d?auto=format&fit=crop&q=80&w=800"
                alt="Signature Tiered Cake"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 z-20 bg-white dark:bg-surface p-6 rounded-2xl shadow-xl border border-border transform -rotate-6">
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl font-serif italic font-bold text-primary">500+</span>
                <span className="text-[10px] uppercase tracking-widest text-muted font-bold">Cakes Made</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
