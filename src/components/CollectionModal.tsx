import React from 'react';
import { X } from '../icons';

interface CollectionModalProps {
  title: string;
  images: string[];
  onClose: () => void;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({ title, images, onClose }) => {
  return (
    <div className="fixed inset-0 z-[160] bg-dark/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col relative">
        <div className="flex justify-between items-center mb-12 sticky top-0 z-50 bg-dark/80 backdrop-blur-sm p-4 rounded-2xl">
          <div>
            <h2 className="text-4xl font-serif italic font-bold text-white">{title} Collection</h2>
            <p className="text-muted text-sm mt-1 uppercase tracking-widest">Scroll to explore</p>
          </div>
          <button onClick={onClose} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
            <X size={32} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto no-scrollbar space-y-[20vh] pb-[40vh] px-4">
          {images.map((img, i) => (
            <div 
              key={i} 
              className="sticky top-32 w-full aspect-[4/5] md:aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
              style={{ 
                zIndex: i,
                transform: `scale(${1 - (images.length - i) * 0.02}) translateY(${i * 10}px)` 
              }}
            >
              <img 
                src={img} 
                alt={`${title} ${i}`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-12">
                <span className="text-white/50 font-mono text-sm">0{i + 1} / 0{images.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
