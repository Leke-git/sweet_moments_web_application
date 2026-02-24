import React from 'react';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Gallery } from './components/Gallery';
import { Kitchen } from './components/Kitchen';
import { Reviews } from './components/Reviews';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { OrderWizard } from './components/OrderWizard';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatWidget } from './components/ChatWidget';
import { LegalModal } from './components/LegalModal';
import { CollectionModal } from './components/CollectionModal';
import { SiteConfig, User } from './types';
import { DEFAULT_CONFIG, ADMIN_EMAILS, GALLERY_CATEGORIES } from './constants';
import { supabase } from './lib/supabase';
import { Loader2 } from './icons';

export default function App() {
  const [darkMode, setDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [user, setUser] = React.useState<User | null>(null);
  const [config, setConfig] = React.useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = React.useState(true);
  
  const [showOrderModal, setShowOrderModal] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showAdminPanel, setShowAdminPanel] = React.useState(false);
  const [legalModal, setLegalModal] = React.useState<{ title: string, type: 'faqs' | 'terms' | 'privacy' } | null>(null);
  const [collectionModal, setCollectionModal] = React.useState<typeof GALLERY_CATEGORIES[0] | null>(null);
  const [activeSection, setActiveSection] = React.useState('home');

  // Dark Mode Effect
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Auth & Config Effect
  React.useEffect(() => {
    const init = async () => {
      try {
        if (supabase) {
          // Check session
          const sessionResponse = await supabase.auth.getSession();
          const session = sessionResponse.data.session;
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata.full_name || session.user.email!.split('@')[0],
              role: ADMIN_EMAILS.includes(session.user.email!) ? 'admin' : 'customer'
            });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              const isAdmin = ADMIN_EMAILS.includes(session.user.email!);
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata.full_name || session.user.email!.split('@')[0],
                role: isAdmin ? 'admin' : 'customer'
              });
              setShowAuthModal(false);
              if (isAdmin) {
                setShowAdminPanel(true);
              }
            } else {
              setUser(null);
            }
          });

          // Load Config
          const configResponse = await supabase.from('site_config').select('config').eq('id', 1).single();
          if (configResponse.data?.config) {
            setConfig(configResponse.data.config);
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Scroll Spy Effect
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'gallery', 'kitchen', 'reviews', 'about', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top >= -100 && rect.top <= 300;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center space-y-6">
        <div className="noise" />
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-serif italic font-bold text-primary">S</span>
          </div>
        </div>
        <div className="text-center space-y-2 animate-pulse">
          <h1 className="text-3xl font-serif italic font-bold text-dark">Sweet Moments</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-muted font-bold">Preparing the magic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-dark selection:bg-primary/20 selection:text-primary">
      <Nav 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenOrder={() => setShowOrderModal(true)}
        onOpenAdmin={() => setShowAdminPanel(true)}
        onSignOut={handleSignOut}
        activeSection={activeSection}
      />

      <main>
        <Hero onOpenOrder={() => setShowOrderModal(true)} />
        <Gallery onViewCollection={(cat) => setCollectionModal(cat)} />
        <Kitchen />
        <Reviews />
        <About />
        <Contact />
      </main>

      <footer className="bg-white dark:bg-black/20 py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-2xl font-serif italic font-bold text-primary">Sweet Moments</span>
              <span className="text-[10px] uppercase tracking-widest text-muted font-bold">Artisan Custom Cakes</span>
            </div>
            <p className="text-sm text-dark/70 dark:text-muted leading-relaxed">
              Crafting bespoke edible art for your most cherished celebrations. Every cake tells a story.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="font-bold uppercase tracking-widest text-xs text-dark">Quick Links</h4>
            <ul className="space-y-4 text-sm text-dark/70 dark:text-muted">
              <li><a href="#home" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="#gallery" className="hover:text-primary transition-colors">Gallery</a></li>
              <li><a href="#kitchen" className="hover:text-primary transition-colors">The Kitchen</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors">Meet Sarah</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold uppercase tracking-widest text-xs text-dark">Support</h4>
            <ul className="space-y-4 text-sm text-dark/70 dark:text-muted">
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><button onClick={() => setLegalModal({ title: 'Frequently Asked Questions', type: 'faqs' })} className="hover:text-primary transition-colors">FAQs</button></li>
              <li><button onClick={() => setLegalModal({ title: 'Terms of Service', type: 'terms' })} className="hover:text-primary transition-colors">Terms of Service</button></li>
              <li><button onClick={() => setLegalModal({ title: 'Privacy Policy', type: 'privacy' })} className="hover:text-primary transition-colors">Privacy Policy</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold uppercase tracking-widest text-xs text-dark">Newsletter</h4>
            <p className="text-sm text-dark/70 dark:text-muted">Join our circle for seasonal flavours and inspiration.</p>
              <div className="flex space-x-2">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-bg dark:bg-black/20 border border-border px-4 py-2 rounded-xl text-sm outline-none focus:border-primary w-full text-dark dark:text-white"
                />
                <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold">Join</button>
              </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-border text-center">
          <p className="text-xs text-dark/60 dark:text-muted">© {new Date().getFullYear()} Sweet Moments Artisan Bakery. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      {showOrderModal && (
        <OrderWizard 
          config={config} 
          onClose={() => setShowOrderModal(false)} 
          userEmail={user?.email}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showAdminPanel && user && ADMIN_EMAILS.includes(user.email) && (
        <AdminDashboard 
          user={user} 
          onClose={() => setShowAdminPanel(false)} 
          initialConfig={config}
          onConfigUpdate={setConfig}
        />
      )}

      {legalModal && (
        <LegalModal 
          title={legalModal.title} 
          type={legalModal.type} 
          onClose={() => setLegalModal(null)} 
        />
      )}

      {collectionModal && (
        <CollectionModal 
          title={collectionModal.title} 
          images={collectionModal.images} 
          onClose={() => setCollectionModal(null)} 
        />
      )}

      <ChatWidget />
    </div>
  );
}
