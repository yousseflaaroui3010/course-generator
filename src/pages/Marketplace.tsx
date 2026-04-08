import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Clock, BookOpen, Shield, Loader2, ChevronDown } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function Marketplace() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All'); // All, Free, Premium

  const categories = ['All', 'Technology', 'Business', 'Design', 'Marketing', 'Personal Development'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // In a real app, we might filter by published == true
        // For now, let's fetch all courses and we can filter client-side or add the published flag later
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCourses(coursesData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
    
    let matchesPrice = true;
    if (priceFilter === 'Free') matchesPrice = !course.price || course.price === 0;
    if (priceFilter === 'Premium') matchesPrice = course.price && course.price > 0;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Discover Courses</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Explore our catalog of AI-generated and expert-curated courses.</p>
        </div>
        
        <div className="w-full md:w-96 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center text-gray-500 dark:text-gray-400 mr-2">
          <Filter className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 border-none text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 py-2 pl-3 pr-8 text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </select>

        <select 
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 border-none text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 py-2 pl-3 pr-8 text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          {difficulties.map(d => <option key={d} value={d}>{d === 'All' ? 'All Levels' : d}</option>)}
        </select>

        <select 
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 border-none text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 py-2 pl-3 pr-8 text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          <option value="All">Any Price</option>
          <option value="Free">Free</option>
          <option value="Premium">Premium</option>
        </select>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No courses found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Link 
              key={course.id} 
              to={`/course/${course.id}`}
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              {/* Card Header / Image Placeholder */}
              <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                {course.price && course.price > 0 && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-700 flex items-center shadow-sm">
                    <Shield className="w-3 h-3 mr-1" />
                    PRO
                  </div>
                )}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="bg-black/40 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md border border-white/10">
                    {course.category || 'General'}
                  </span>
                  <span className="bg-black/40 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md border border-white/10">
                    {course.difficulty || 'Beginner'}
                  </span>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
                  {course.description || 'No description available.'}
                </p>
                
                {/* Card Footer */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-auto">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <BookOpen className="w-4 h-4 mr-1.5" />
                    {course.chapters?.length || 0} Chapters
                  </div>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {course.rating ? course.rating.toFixed(1) : 'New'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
