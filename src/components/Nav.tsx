import React from 'react';
import { Menu, X, Sun, Moon, UserIcon, ShoppingCart, LayoutDashboard, LogOut } from '../icons';
import { User } from '../types';
import { ADMIN_EMAILS } from '../constants';

interface NavProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  user: User | null;
  onOpenAuth: () => void;
  onOpenOrder: () => void;
  onOpenAdmin: () => void;
  onSignOut: () => void;
  activeSection: string;
  bakeryName: string;
}

export const Nav: React.FC<NavProps> = ({
  darkMode,
  setDarkMode,
  user,
  onOpenAuth,
  onOpenOrder,
  onOpenAdmin,
  onSignOut,
  activeSection,
  bakeryName
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'The Kitchen', href: '#kitchen' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const isAdmin = user && ADMIN_EMAILS.some(e => e.trim().toLowerCase() === user.email.trim().toLowerCase());

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex flex-col">
            <span className="text-2xl font-serif italic font-semibold text-primary leading-tight">{bakeryName}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium">Artisan Custom Cakes</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === link.href.substring(1) ? 'text-primary' : 'text-dark/70'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded-md hidden lg:inline-block">Admin Mode</span>
                    <button
                      onClick={onOpenAdmin}
                      className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-accent"
                      title="Admin Dashboard"
                    >
                      <LayoutDashboard size={20} />
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-muted hidden sm:inline-block font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded">{user.email}</span>
                  <button
                    onClick={onSignOut}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted"
                    title="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Account"
              >
                <UserIcon size={20} />
              </button>
            )}

            <button
              onClick={onOpenOrder}
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <ShoppingCart size={18} />
              <span>Order Now</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-dark hover:text-primary transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass border-b border-border animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-4 text-base font-medium text-dark hover:text-primary border-b border-border/50 last:border-0"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 pb-2 flex flex-col space-y-3 px-3">
              {user ? (
                <>
                  {isAdmin && (
                    <button
                      onClick={() => { onOpenAdmin(); setIsOpen(false); }}
                      className="flex items-center space-x-2 text-accent font-medium"
                    >
                      <LayoutDashboard size={20} />
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                  <button
                    onClick={() => { onSignOut(); setIsOpen(false); }}
                    className="flex items-center space-x-2 text-muted font-medium"
                  >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { onOpenAuth(); setIsOpen(false); }}
                  className="flex items-center space-x-2 text-dark font-medium"
                >
                  <UserIcon size={20} />
                  <span>Account</span>
                </button>
              )}
              <button
                onClick={() => { onOpenOrder(); setIsOpen(false); }}
                className="w-full bg-primary text-white px-6 py-3 rounded-full text-center font-semibold shadow-md"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
