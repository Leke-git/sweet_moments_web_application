import React from 'react';
import { GALLERY_CATEGORIES } from '../constants';
import { ArrowRight } from '../icons';

const CategorySlideshowCard: React.FC<{ 
  category: typeof GALLERY_CATEGORIES[0],
  onViewCollection: (cat: typeof GALLERY_CATEGORIES[0]) => void 
}> = ({ category, onViewCollection }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % category.images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [category.images.length]);

  return (
    <div className="sticky top-0 h-screen w-full flex items-center justify-center p-4 md:p-8 bg-bg">
      <div className="relative w-full max-w-6xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl group">
        {/* Images */}
        {category.images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={img}
              alt={`${category.title} ${idx + 1}`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        ))}

        {/* Content */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white z-10">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/80 backdrop-blur-sm text-xs font-bold uppercase tracking-[0.2em]">
              {category.category}
            </span>
            <h3 className="text-4xl md:text-6xl font-serif italic font-semibold leading-tight">
              {category.title}
            </h3>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light">
              {category.description}
            </p>
            <button 
              onClick={() => onViewCollection(category)}
              className="mt-4 flex items-center space-x-2 text-white font-semibold group/btn"
            >
              <span>View Collection</span>
              <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>

        {/* Indicators */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col space-y-3 z-20">
          {category.images.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-12 rounded-full transition-all duration-500 ${
                idx === currentImageIndex ? 'bg-primary h-16' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const Gallery: React.FC<{ 
  onViewCollection: (cat: typeof GALLERY_CATEGORIES[0]) => void 
}> = ({ onViewCollection }) => {
  return (
    <section id="gallery" className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl md:text-7xl font-serif italic font-semibold text-dark">Our Portfolio</h2>
        <p className="mt-4 text-muted max-w-2xl mx-auto text-lg">
          A curated selection of our most beloved bespoke creations.
        </p>
      </div>

      <div className="relative">
        {GALLERY_CATEGORIES.map((cat) => (
          <CategorySlideshowCard 
            key={cat.id} 
            category={cat} 
            onViewCollection={onViewCollection}
          />
        ))}
      </div>
    </section>
  );
};
