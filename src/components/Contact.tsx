import React from 'react';
import { Mail, Phone, MapPin, Clock, Instagram, Facebook, Check, Loader2 } from '../icons';
import { supabase } from '../lib/supabase';

export const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      if (supabase) {
        await supabase.from('enquiries').insert([data]);
      }

      // Trigger n8n Webhook if configured
      const n8nWebhook = import.meta.env.VITE_N8N_ENQUIRY_WEBHOOK_URL;
      if (n8nWebhook) {
        await fetch(n8nWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, type: 'new_enquiry' })
        }).catch(err => console.error("n8n Enquiry Webhook failed:", err));
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Enquiry submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-7xl font-serif italic font-semibold text-dark">Get In Touch</h2>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            Have a vision for a cake? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info Column */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-primary">
                  <Mail size={20} />
                  <h4 className="font-bold uppercase tracking-widest text-xs">Email Us</h4>
                </div>
                <p className="text-muted">bn.gbemileke@gmail.com</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-primary">
                  <Phone size={20} />
                  <h4 className="font-bold uppercase tracking-widest text-xs">Call Us</h4>
                </div>
                <p className="text-muted">+44 (0) 7400 123456</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-primary">
                  <MapPin size={20} />
                  <h4 className="font-bold uppercase tracking-widest text-xs">Visit Us</h4>
                </div>
                <p className="text-muted">12 Artisan Way, London, E1 6QL</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-primary">
                  <Clock size={20} />
                  <h4 className="font-bold uppercase tracking-widest text-xs">Hours</h4>
                </div>
                <p className="text-muted">Tue - Sat: 10am - 6pm</p>
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <h4 className="font-bold uppercase tracking-widest text-xs text-muted mb-6">Follow Our Journey</h4>
              <div className="flex space-x-6">
                <a href="#" className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                  <Instagram size={24} />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                  <Facebook size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-white dark:bg-surface p-8 md:p-12 rounded-[3rem] shadow-xl border border-border relative overflow-hidden">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                  <Check size={40} className="draw-check" />
                </div>
                <h3 className="text-3xl font-serif italic font-bold text-dark">Message Received!</h3>
                <p className="text-muted">Thank you for reaching out. Sarah will get back to you within 48 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-primary font-bold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted">Name</label>
                    <input
                      required
                      name="name"
                      type="text"
                      placeholder="Your name"
                      className="w-full px-6 py-4 rounded-2xl bg-bg dark:bg-black/20 border border-border focus:border-primary outline-none transition-all text-dark dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted">Email</label>
                    <input
                      required
                      name="email"
                      type="email"
                      placeholder="Your email"
                      className="w-full px-6 py-4 rounded-2xl bg-bg dark:bg-black/20 border border-border focus:border-primary outline-none transition-all text-dark dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">Subject</label>
                  <input
                    required
                    name="subject"
                    type="text"
                    placeholder="What are you enquiring about?"
                    className="w-full px-6 py-4 rounded-2xl bg-bg dark:bg-black/20 border border-border focus:border-primary outline-none transition-all text-dark dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted">Message</label>
                  <textarea
                    required
                    name="message"
                    rows={4}
                    placeholder="Tell us about your event..."
                    className="w-full px-6 py-4 rounded-2xl bg-bg dark:bg-black/20 border border-border focus:border-primary outline-none transition-all resize-none text-dark dark:text-white"
                  />
                </div>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <span>Send Enquiry</span>
                      <Check size={20} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
