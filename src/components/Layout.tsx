import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Video, Settings, LayoutDashboard, User, LogOut, Sparkles, Compass, Map, BarChart2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const location = useLocation();
  const { profile, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/discover', label: 'Discover', icon: Compass },
    { path: '/paths', label: 'Learning Paths', icon: Map },
    { path: '/build', label: 'Course Builder', icon: BookOpen, role: 'teacher' },
    { path: '/analytics', label: 'Analytics', icon: BarChart2, role: 'teacher' },
    { path: '/studio', label: 'Video Studio', icon: Video, role: 'teacher' },
    { path: '/admin', label: 'Admin', icon: Settings, role: 'admin' },
    { path: '/pricing', label: 'Pricing', icon: Sparkles },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.role) return true;
    if (!profile) return false;
    const roles = ['student', 'teacher', 'admin'];
    return roles.indexOf(profile.role) >= roles.indexOf(item.role as any);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">LuminaLearn</span>
              </Link>
              <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                                  (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-indigo-500 text-gray-900 dark:text-white'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {profile && (
                <div className="flex items-center space-x-3 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                  <img 
                    src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}`} 
                    alt={profile.displayName || 'User'} 
                    className="w-6 h-6 rounded-full border border-white dark:border-gray-900"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 hidden md:inline">{profile.displayName}</span>
                  <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded">
                    {profile.role}
                  </span>
                </div>
              )}
              <Link 
                to="/settings"
                className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all focus:outline-none"
              >
                <User className="w-6 h-6" />
              </Link>
              <button 
                onClick={logout}
                className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all focus:outline-none"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
