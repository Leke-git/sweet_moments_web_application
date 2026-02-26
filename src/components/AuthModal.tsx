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
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [stayLoggedIn, setStayLoggedIn] = React.useState(true);

  const [resendTimer, setResendTimer] = React.useState(0);
  const codeRefs = [
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null),
    React.useRef<HTMLInputElement>(null)
  ];

  React.useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newCode = code.split('');
    newCode[index] = value;
    const finalCode = newCode.join('').slice(0, 4);
    setCode(finalCode);

    // Move to next input
    if (value && index < 3) {
      codeRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs[index - 1].current?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mode }),
      });
      setResendTimer(60);
    } catch (error) {
      console.error("Resend error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to request code");
      }
      
      setStep('code');
      setResendTimer(60);
    } catch (error: any) {
      console.error("Auth error:", error);
      alert(error.message || "Failed to send code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, stayLoggedIn }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid code");
      }

      const { hash } = await response.json();
      
      if (supabase) {
        window.location.hash = hash;
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
              {step === 'email' 
                ? (mode === 'login' ? 'Welcome Back' : 'Join Us') 
                : 'Verify Identity'}
            </h2>
            <p className="text-muted">
              {step === 'email' 
                ? (mode === 'login' ? 'Sign in to manage your orders.' : 'Create an account to start ordering.') 
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
                    className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white dark:bg-black/20 border border-border focus:border-primary outline-none transition-all text-dark dark:text-white placeholder:text-muted/50"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 ml-4">
                <input 
                  type="checkbox" 
                  id="stayLoggedIn"
                  checked={stayLoggedIn}
                  onChange={(e) => setStayLoggedIn(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="stayLoggedIn" className="text-sm text-muted cursor-pointer">Stay logged in</label>
              </div>
              
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    <span>{mode === 'login' ? 'Send Login Code' : 'Create Account'}</span>
                    <Check size={20} />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted">
                  {mode === 'login' ? "New here?" : "Already have an account?"}{' '}
                  <button 
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-primary font-bold hover:underline"
                  >
                    {mode === 'login' ? 'Create an account' : 'Sign in instead'}
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-8">
              <div className="flex justify-between gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    ref={codeRefs[i]}
                    required
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={code[i] || ''}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-16 h-20 rounded-2xl bg-white dark:bg-black/20 border-2 border-border focus:border-primary outline-none transition-all text-center text-3xl font-bold text-dark dark:text-white"
                  />
                ))}
              </div>
              
              <div className="space-y-4">
                <button
                  disabled={isSubmitting || code.length !== 4}
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
                
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-xs text-muted">Resend code in <span className="font-bold text-primary">{resendTimer}s</span></p>
                  ) : (
                    <button 
                      type="button"
                      onClick={handleResendCode}
                      className="text-sm text-primary font-bold hover:underline"
                    >
                      Didn't receive code? Resend
                    </button>
                  )}
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setStep('email')}
                className="text-xs text-muted hover:text-primary transition-colors"
              >
                ← Change Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
