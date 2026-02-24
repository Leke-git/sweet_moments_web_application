import React from 'react';
import { X, Mail, Loader2, Check } from '../icons';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [step, setStep] = React.useState<'email' | 'code'>('email');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to request code");
      }
      
      setStep('code');
    } catch (error: any) {
      console.error("Auth error:", error);
      alert(error.message || "Failed to send code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid code");
      }

      const { hash } = await response.json();
      
      // Sign in using the hash returned by the server
      if (supabase) {
        // The hash contains the access token, Supabase client handles it automatically if we redirect or set it
        window.location.hash = hash;
        // Reload to let Supabase process the hash
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      alert(error.message || "Verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg dark:bg-surface w-full max-w-md rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="noise z-0" />
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all z-50 text-dark cursor-pointer"
        >
          <X size={24} />
        </button>

        <div className="p-12 relative z-10 text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-serif italic font-bold text-dark">
              {step === 'email' ? 'Welcome Back' : 'Verify Identity'}
            </h2>
            <p className="text-muted">
              {step === 'email' 
                ? 'Sign in to manage your orders and profile.' 
                : `Enter the 4-digit code sent to ${email}`}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleRequestCode} className="space-y-6">
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
                    className="w-full pl-16 pr-6 py-5 rounded-2xl bg-bg dark:bg-black/20 border border-border focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    <span>Send Code</span>
                    <Check size={20} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold uppercase tracking-widest text-muted ml-4">4-Digit Code</label>
                <input
                  required
                  type="text"
                  maxLength={4}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                  className="w-full px-6 py-5 rounded-2xl bg-bg dark:bg-black/20 border border-border focus:border-primary outline-none transition-all text-center text-3xl tracking-[1em] font-bold"
                />
              </div>
              
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    <span>Verify & Login</span>
                    <Check size={20} />
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={() => setStep('email')}
                className="text-sm text-primary font-bold hover:underline"
              >
                Change Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
