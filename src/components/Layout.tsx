import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Video, Settings, LayoutDashboard, User } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/build', label: 'Course Builder', icon: BookOpen },
    { path: '/studio', label: 'Video Studio', icon: Video },
    { path: '/admin', label: 'Admin', icon: Settings },
  ];

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
                {navItems.map((item) => {
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
            <div className="flex items-center">
              <Link 
                to="/settings"
                className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all focus:outline-none"
              >
                <User className="w-6 h-6" />
              </Link>
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
