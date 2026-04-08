import React, { useState } from 'react';
import { Search, Star, Users, MessageSquare, Video, BookOpen, Filter, MapPin, DollarSign, CheckCircle, ArrowRight, Sparkles, Plus, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

const TUTORS = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    role: 'Senior AI Researcher',
    avatar: 'https://picsum.photos/seed/sarah/200/200',
    rating: 4.9,
    reviews: 124,
    subjects: ['Machine Learning', 'Python', 'Data Science'],
    price: 45,
    status: 'online',
    bio: 'Helping students master complex AI concepts through intuitive, project-based learning.'
  },
  {
    id: '2',
    name: 'James Wilson',
    role: 'Full Stack Developer',
    avatar: 'https://picsum.photos/seed/james/200/200',
    rating: 4.8,
    reviews: 89,
    subjects: ['React', 'Node.js', 'System Design'],
    price: 35,
    status: 'offline',
    bio: '10+ years of industry experience. I focus on building real-world applications.'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    role: 'UX/UI Design Lead',
    avatar: 'https://picsum.photos/seed/elena/200/200',
    rating: 5.0,
    reviews: 56,
    subjects: ['Figma', 'Product Design', 'Visual Arts'],
    price: 50,
    status: 'online',
    bio: 'Passionate about creating beautiful, user-centric digital experiences.'
  },
  {
    id: '4',
    name: 'Prof. Michael Brown',
    role: 'Mathematics Professor',
    avatar: 'https://picsum.photos/seed/michael/200/200',
    rating: 4.7,
    reviews: 210,
    subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
    price: 40,
    status: 'online',
    bio: 'Making mathematics accessible and exciting for everyone.'
  }
];

export default function TutorDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Tutor Marketplace</h1>
          <p className="text-slate-500 dark:text-slate-400">Connect with expert educators and scale your teaching impact.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
            Manage Profile
          </button>
          <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-sm flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search for tutors by name, subject, or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-900 dark:text-white"
          />
        </div>
        <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Tutor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TUTORS.map((tutor) => (
          <motion.div
            key={tutor.id}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group"
          >
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 ${tutor.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{tutor.name}</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mt-1">{tutor.role}</p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-6 py-4 border-y border-slate-50 dark:border-slate-800">
                <div className="text-center">
                  <div className="flex items-center text-amber-500 font-bold text-sm">
                    <Star className="w-3.5 h-3.5 mr-1 fill-current" /> {tutor.rating}
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Rating</p>
                </div>
                <div className="text-center">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{tutor.reviews}</div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Reviews</p>
                </div>
                <div className="text-center">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">${tutor.price}</div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">/ Hr</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {tutor.subjects.map(sub => (
                    <span key={sub} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded border border-slate-100 dark:border-slate-700">
                      {sub}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {tutor.bio}
                </p>
              </div>

              <button className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white transition-all flex items-center justify-center">
                View Profile <ExternalLink className="w-3 h-3 ml-2" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Featured Section - Minimalist SaaS Style */}
      <div className="p-10 bg-slate-900 dark:bg-indigo-600 rounded-3xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3 mr-2" />
              Tutor Growth
            </div>
            <h2 className="text-3xl font-bold tracking-tight leading-tight">Scale your teaching with AI-powered tools.</h2>
            <p className="text-indigo-100 leading-relaxed">
              Our platform provides tutors with automated course generation, student analytics, and marketing tools to help you reach more learners.
            </p>
            <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-2">
              <Users className="w-5 h-5 text-indigo-300" />
              <div className="text-2xl font-bold">2.5k+</div>
              <p className="text-indigo-200 text-xs">Active Students</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-2">
              <Video className="w-5 h-5 text-indigo-300" />
              <div className="text-2xl font-bold">150+</div>
              <p className="text-indigo-200 text-xs">Video Courses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
