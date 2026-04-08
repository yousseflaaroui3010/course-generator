import { useState, useEffect } from 'react';
import { User, Bell, Shield, Globe, Moon, Sun, Monitor, Save, Loader2, Camera, Mail, Lock, Settings as SettingsIcon, CreditCard, Sparkles } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user, profile: userProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (searchParams.get('session_id')) {
      showToast('Subscription successful! Welcome to Pro.', 'success');
      setActiveTab('subscription');
    }
  }, [searchParams]);

  // Profile State
  const [profile, setProfile] = useState({
    name: 'Youssef Laaroui',
    email: 'yousseflaaroui1@gmail.com',
    bio: 'Senior Software Engineer passionate about AI and education.',
    avatar: 'https://picsum.photos/seed/youssef/200/200',
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    language: 'English',
    notifications: {
      email: true,
      push: false,
      courseUpdates: true,
    },
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    showToast('Profile updated successfully', 'success');
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    showToast('Preferences saved', 'success');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="relative group">
                        <img
                          src={profile.avatar}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-800"
                          referrerPolicy="no-referrer"
                        />
                        <input
                          type="file"
                          id="avatar-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProfile({ ...profile, avatar: reader.result as string });
                                showToast('Avatar updated locally', 'success');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Camera className="w-6 h-6 text-white" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Profile Picture</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">JPG, GIF or PNG. Max size of 2MB.</p>
                        <div className="mt-3 flex space-x-3">
                          <button 
                            type="button" 
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                          >
                            Upload new
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setProfile({ ...profile, avatar: 'https://picsum.photos/seed/default/200/200' })}
                            className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full pl-10 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 p-2.5 border cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                        <textarea
                          rows={4}
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          className="w-full border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border dark:bg-gray-800 dark:text-white"
                          placeholder="Tell us a bit about yourself..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'subscription' && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Subscription Plan</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage your billing and subscription details.</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      userProfile?.subscription?.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {userProfile?.subscription?.status === 'active' ? 'Active' : 'Free Plan'}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mr-4">
                          <Sparkles className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {userProfile?.subscription?.planId === 'pro_monthly' ? 'Pro Monthly' : 'Free Tier'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {userProfile?.subscription?.status === 'active' 
                              ? `Next billing date: ${new Date(userProfile.subscription.currentPeriodEnd).toLocaleDateString()}`
                              : 'Upgrade to unlock all features'}
                          </p>
                        </div>
                      </div>
                      {userProfile?.subscription?.status !== 'active' && (
                        <Link 
                          to="/pricing"
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Upgrade
                        </Link>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                        Unlimited course generation
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                        Advanced AI models
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                        Priority support
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Billing History</h3>
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm italic">
                      No transactions found.
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">App Preferences</h2>
                    <div className="space-y-8">
                      {/* Theme Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Appearance</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: 'light', label: 'Light', icon: Sun },
                            { id: 'dark', label: 'Dark', icon: Moon },
                            { id: 'system', label: 'System', icon: Monitor },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setTheme(t.id as any)}
                              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                                theme === t.id
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                  : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              <t.icon className="w-6 h-6 mb-2" />
                              <span className="text-sm font-medium">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Language Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <select
                            value={preferences.language}
                            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                            className="w-full pl-10 border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border appearance-none dark:bg-gray-800 dark:text-white"
                          >
                            <option>English</option>
                            <option>French</option>
                            <option>Spanish</option>
                            <option>German</option>
                            <option>Arabic</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          onClick={handleSavePreferences}
                          disabled={isSaving}
                          className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notifications</h2>
                    <div className="space-y-6">
                      {[
                        { id: 'email', label: 'Email Notifications', desc: 'Receive updates via your registered email.' },
                        { id: 'push', label: 'Push Notifications', desc: 'Get real-time alerts in your browser.' },
                        { id: 'courseUpdates', label: 'Course Updates', desc: 'Get notified when your courses are ready.' },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setPreferences({
                              ...preferences,
                              notifications: {
                                ...preferences.notifications,
                                [item.id]: !preferences.notifications[item.id as keyof typeof preferences.notifications]
                              }
                            })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              preferences.notifications[item.id as keyof typeof preferences.notifications] ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences.notifications[item.id as keyof typeof preferences.notifications] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>
                    <div className="space-y-6">
                      <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4">
                        <div className="flex items-center space-x-3">
                          <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <h3 className="font-medium text-gray-900 dark:text-white">Change Password</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Update your password to keep your account secure.</p>
                        <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                          Update password →
                        </button>
                      </div>

                      <div className="p-6 border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl space-y-4">
                        <h3 className="font-medium text-red-900 dark:text-red-400">Danger Zone</h3>
                        <p className="text-sm text-red-700 dark:text-red-300/70">Once you delete your account, there is no going back. Please be certain.</p>
                        <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
