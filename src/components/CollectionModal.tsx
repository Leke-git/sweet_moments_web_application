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
      <div className="w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-serif italic font-bold text-white">{title} Collection</h2>
          <button onClick={onClose} className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
            <X size={32} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {images.map((img, i) => (
            <div key={i} className="aspect-square rounded-[2rem] overflow-hidden group">
              <img 
                src={img} 
                alt={`${title} ${i}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
          {/* Add some extra placeholders to make it look full */}
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={`p-${n}`} className="aspect-square rounded-[2rem] overflow-hidden bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
};
