import React from 'react';
import { X } from '../icons';

interface LegalModalProps {
  title: string;
  onClose: () => void;
  type: 'faqs' | 'terms' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({ title, onClose, type }) => {
  const content = {
    faqs: [
      { q: "How much notice do you need?", a: "We typically require at least 7 days notice for custom cakes, but 2-4 weeks is recommended for larger events." },
      { q: "Do you deliver?", a: "Yes, we offer delivery within London for a flat fee of £25. Pickup is also available from our kitchen." },
      { q: "Can you do gluten-free or vegan?", a: "Absolutely! We have dedicated recipes for both. Please select these options in the order wizard." },
      { q: "How do I pay?", a: "Once we confirm your order details, we'll send a secure payment link for a 50% deposit." }
    ],
    terms: [
      "All orders are subject to availability.",
      "A 50% non-refundable deposit is required to secure your date.",
      "Cancellations made within 48 hours of the delivery date are non-refundable.",
      "We are not responsible for damage once the cake has been delivered or picked up."
    ],
    privacy: [
      "We collect your name, email, and phone number solely for order processing.",
      "Your data is never shared with third parties for marketing purposes.",
      "We use secure Supabase storage for all customer information.",
      "You can request deletion of your data at any time by contacting us."
    ]
  };

  return (
    <div className="fixed inset-0 z-[150] bg-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg dark:bg-surface w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden max-h-[80vh] flex flex-col">
        <div className="noise z-0" />
        <div className="p-8 border-b border-border flex justify-between items-center relative z-10">
          <h2 className="text-3xl font-serif italic font-bold text-dark">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto relative z-10 no-scrollbar">
          {type === 'faqs' ? (
            <div className="space-y-8">
              {content.faqs.map((faq, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="font-bold text-primary">{faq.q}</h4>
                  <p className="text-muted leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-6 list-disc pl-6">
              {content[type].map((item, i) => (
                <li key={i} className="text-muted leading-relaxed">{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
