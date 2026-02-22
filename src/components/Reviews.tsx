import React from 'react';
import { REVIEWS } from '../constants';
import { Star } from '../icons';

export const Reviews: React.FC = () => {
  return (
    <section id="reviews" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-7xl font-serif italic font-semibold text-dark">What Clients Say</h2>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            Kind words from those who have shared our Sweet Moments.
          </p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-8">
          {REVIEWS.map((review, idx) => (
            <div key={idx} className="bg-white dark:bg-surface rounded-[2.5rem] p-8 shadow-sm border border-border flex flex-col h-full">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={review.clientImage}
                  alt={review.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-dark">{review.name}</h4>
                  <div className="flex text-accent">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-muted italic leading-relaxed mb-8 flex-grow">
                "{review.comment}"
              </p>

              <div className="relative h-48 rounded-2xl overflow-hidden">
                <img
                  src={review.cakeImage}
                  alt="Review Cake"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
