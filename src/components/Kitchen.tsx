import React from 'react';
import { Sparkles, Globe, Star, Info } from '../icons';

export const Kitchen: React.FC = () => {
  const features = [
    {
      icon: <Globe className="text-primary" size={32} />,
      title: "Sourced Ingredients",
      description: "We use only the finest ingredients: local organic eggs, premium Valrhona chocolate, and authentic Madagascar vanilla beans."
    },
    {
      icon: <Sparkles className="text-primary" size={32} />,
      title: "Bespoke Designs",
      description: "Every cake is a unique collaboration. We don't use templates; we build your vision from the ground up."
    },
    {
      icon: <Star className="text-primary" size={32} />,
      title: "Artisan Technique",
      description: "From hand-pressed florals to intricate Lambeth piping, our techniques are rooted in traditional craftsmanship."
    },
    {
      icon: <Info className="text-primary" size={32} />,
      title: "The Consultation",
      description: "A personal journey to understand your style, palette, and story before we even touch the flour."
    }
  ];

  return (
    <section id="kitchen" className="py-24 bg-surface/50 dark:bg-surface/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-7xl font-serif italic font-semibold text-dark">The Kitchen</h2>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            Where artistry meets alchemy. Our process is as refined as our results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, idx) => (
            <div key={idx} className="bg-white dark:bg-surface p-8 rounded-3xl shadow-sm border border-border hover:shadow-xl transition-all hover:-translate-y-1 group">
              <div className="mb-6 w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-serif italic font-bold mb-3 text-dark">{f.title}</h3>
              <p className="text-muted leading-relaxed text-sm">
                {f.description}
              </p>
            </div>
          ))}
        </div>

        {/* Video Section */}
        <div className="mt-20 relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-surface aspect-video">
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
            <div className="text-center text-white space-y-4">
              <h3 className="text-4xl font-serif italic font-bold">Sarah in the Kitchen</h3>
              <p className="uppercase tracking-[0.3em] text-xs font-bold">A glimpse into the magic</p>
            </div>
          </div>
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          >
            <source src="https://player.vimeo.com/external/494252666.sd.mp4?s=72973a9285122f36eca4f0c33b17444f8777a621&profile_id=165&oauth2_token_id=57447761" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
};
