import React from 'react';
import { useAuth } from '../components/AuthProvider';
import { signInWithGoogle } from '../lib/firebase';
import { GraduationCap, BookOpen, Sparkles, Search, Users, Video, ArrowRight, CheckCircle2, Globe, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const { setRole } = useAuth();

  const handleLogin = async (role: 'student' | 'tutor') => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        await setRole(role);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Navigation Placeholder */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">LuminaLearn</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleLogin('student')}
              className="text-sm font-semibold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => handleLogin('student')}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wider uppercase mb-6">
                <Sparkles className="w-3 h-3 mr-2" />
                AI-Powered Education
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Master any subject with <br/>
                <span className="text-indigo-600">personalized AI guidance.</span>
              </h1>
              <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                The world's first AI-native learning platform. Connect with expert tutors or generate custom courses tailored to your unique learning style.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <button 
                onClick={() => handleLogin('student')}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center"
              >
                Start Learning <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button 
                onClick={() => handleLogin('tutor')}
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center"
              >
                Become a Tutor
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="pt-12 flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
            >
              {['Coursera', 'Udemy', 'Skillshare', 'MasterClass'].map(brand => (
                <span key={brand} className="text-xl font-black tracking-tighter text-slate-400">{brand}</span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid - Minimalist SaaS Style */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Everything you need to excel</h2>
            <p className="text-slate-600 dark:text-slate-400">We've combined the best of human expertise with cutting-edge AI to create a learning experience that actually works.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Course Generation",
                desc: "Turn any topic or document into a structured, interactive course in seconds.",
                icon: Zap,
                color: "text-amber-500",
                bg: "bg-amber-50 dark:bg-amber-900/20"
              },
              {
                title: "Expert Marketplace",
                desc: "Connect with verified tutors from around the world for 1-on-1 guidance.",
                icon: Globe,
                color: "text-blue-500",
                bg: "bg-blue-50 dark:bg-blue-900/20"
              },
              {
                title: "Verified Learning",
                desc: "Earn certificates and track your progress with our advanced analytics dashboard.",
                icon: ShieldCheck,
                color: "text-emerald-500",
                bg: "bg-emerald-50 dark:bg-emerald-900/20"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-y border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Students", value: "50k+" },
              { label: "Expert Tutors", value: "2.4k" },
              { label: "Courses Created", value: "120k+" },
              { label: "Success Rate", value: "98%" }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-[32px] p-12 lg:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Ready to start your journey?</h2>
              <p className="text-indigo-100 text-lg max-w-xl mx-auto">Join thousands of students and tutors who are already shaping the future of education.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => handleLogin('student')}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all"
                >
                  Join as Student
                </button>
                <button 
                  onClick={() => handleLogin('tutor')}
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all"
                >
                  Join as Tutor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">LuminaLearn</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">© 2026 LuminaLearn Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-indigo-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
