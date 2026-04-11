import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Video, Settings, LayoutDashboard, User, LogOut, Sparkles, Compass, Map, BarChart2, ShoppingCart, CreditCard, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import CartDrawer from './CartDrawer';
import { useCartStore } from '../store/cartStore';

export default function Layout() {
  const location = useLocation();
  const { profile, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setIsOpen: setCartOpen, items: cartItems } = useCartStore();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/discover', label: 'Discover', icon: Compass },
    { path: '/paths', label: 'My Learning', icon: Map },
    { path: '/cart', label: 'Cart', icon: ShoppingCart, action: () => setCartOpen(true) },
    { path: '/billing', label: 'Billing', icon: CreditCard },
    { path: '/build', label: 'Course Builder', icon: BookOpen, role: 'teacher' },
    { path: '/analytics', label: 'Analytics', icon: BarChart2, role: 'teacher' },
    { path: '/studio', label: 'Video Studio', icon: Video, role: 'teacher' },
    { path: '/admin', label: 'Admin', icon: Settings, role: 'admin' },
  ];

  const bottomNavItems = [
    { path: '/pricing', label: 'Pricing', icon: Sparkles },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.role) return true;
    if (!profile) return false;
    const roles = ['student', 'teacher', 'admin'];
    return roles.indexOf(profile.role) >= roles.indexOf(item.role as any);
  });

  const NavLinks = ({ items, onClick }: { items: any[], onClick?: () => void }) => (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || 
                        (item.path !== '/' && location.pathname.startsWith(item.path));
        
        const content = (
          <>
            <Icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.path === '/cart' && cartItems.length > 0 && (
              <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItems.length}
              </span>
            )}
          </>
        );

        const className = `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
          isActive && !item.action
            ? 'bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800/60 dark:text-white'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-50'
        }`;

        if (item.action) {
          return (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                if (onClick) onClick();
              }}
              className={`w-full ${className}`}
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClick}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <CartDrawer />
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white dark:text-slate-900" />
          </div>
          <span className="font-display font-bold text-xl text-slate-900 dark:text-white tracking-tight">Lumina</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col lg:hidden"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white dark:text-slate-900" />
                  </div>
                  <span className="font-display font-bold text-xl text-slate-900 dark:text-white tracking-tight">Lumina</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                <NavLinks items={filteredNavItems} onClick={() => setIsMobileMenuOpen(false)} />
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <NavLinks items={bottomNavItems} onClick={() => setIsMobileMenuOpen(false)} />
                {profile && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}`} 
                        alt={profile.displayName || 'User'} 
                        className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{profile.displayName}</span>
                        <span className="text-xs text-slate-500 capitalize">{profile.role}</span>
                      </div>
                    </div>
                    <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 transition-colors duration-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white tracking-tight">Lumina</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Menu</p>
            <NavLinks items={filteredNavItems} />
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <NavLinks items={bottomNavItems} />
          {profile && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-2">
              <div className="flex items-center space-x-3 overflow-hidden">
                <img 
                  src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}`} 
                  alt={profile.displayName || 'User'} 
                  className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{profile.displayName}</span>
                  <span className="text-xs text-slate-500 capitalize truncate">{profile.role}</span>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen pt-16 lg:pt-0">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
