import React from 'react';
import { X, Mail, Loader2, Check } from '../icons';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          origin: window.location.origin 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to request login link");
      }
      
      setSent(true);
    } catch (error: any) {
      console.error("Auth error:", error);
      alert(error.message || "Failed to send magic link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg dark:bg-surface w-full max-w-md rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="noise z-0" />
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-6 right-6 p-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all z-50 text-dark cursor-pointer"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="p-12 relative z-10 text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-serif italic font-bold text-dark">Welcome Back</h2>
            <p className="text-muted">Sign in to manage your orders and profile.</p>
          </div>

          {sent ? (
            <div className="space-y-6 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mx-auto">
                <Check size={40} className="draw-check" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic font-bold text-dark">Magic Link Sent!</h3>
                <p className="text-muted">Check your email ({email}) for a login link. It might be in your spam folder.</p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-widest text-muted ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={20} />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="eleanor@example.com"
                    className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white dark:bg-black/20 border border-border focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 ml-4">
                <input 
                  type="checkbox" 
                  id="stay-signed-in" 
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary" 
                />
                <label htmlFor="stay-signed-in" className="text-sm text-muted cursor-pointer">Stay signed in</label>
              </div>

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    <span>Send Magic Link</span>
                    <Check size={20} />
                  </>
                )}
              </button>
              <p className="text-[10px] uppercase tracking-widest text-muted font-bold">
                No password required. We'll send a secure link to your inbox.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
