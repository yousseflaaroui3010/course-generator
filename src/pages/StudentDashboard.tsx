import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Clock, Star, Users, ArrowRight, Sparkles, GraduationCap, ChevronRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  { id: 'cs', name: 'Computer Science', icon: '💻', count: 124 },
  { id: 'math', name: 'Mathematics', icon: '📐', count: 86 },
  { id: 'science', name: 'Science', icon: '🔬', count: 92 },
  { id: 'arts', name: 'Arts & Design', icon: '🎨', count: 54 },
  { id: 'business', name: 'Business', icon: '📈', count: 78 },
  { id: 'languages', name: 'Languages', icon: '🌐', count: 65 },
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function StudentDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Welcome & Search */}
      <div className="space-y-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back, Explorer</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">What would you like to master today? Explore our AI-curated curriculum.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search subjects, skills, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3.5 rounded-xl font-semibold flex items-center justify-center transition-all border ${
              showFilters 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Level</label>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedLevel === level 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sort By</label>
                  <select className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>Most Relevant</option>
                    <option>Newest First</option>
                    <option>Highest Rated</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Explore Categories</h2>
          <button className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex items-center hover:underline">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`p-5 rounded-2xl border transition-all text-left group ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50'
              }`}
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h3 className={`font-bold text-sm mb-1 ${selectedCategory === cat.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {cat.name}
              </h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedCategory === cat.id ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                {cat.count} Courses
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {searchQuery || selectedCategory ? 'Search Results' : 'Recommended for you'}
          </h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group"
              >
                <Link to={`/course/${course.id}`} className="block">
                  <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/${course.id}/600/400`} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <PlayCircle className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                      {course.level || 'Beginner'}
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {course.description || 'Master the fundamentals of this subject with our AI-powered curriculum.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 space-x-3">
                        <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> 1.2k</span>
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> 4.5h</span>
                      </div>
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 mr-1 fill-current" /> 4.9
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No courses found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
