import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Clock, BookOpen, Shield, Loader2, ChevronDown, ShoppingCart, Code, Briefcase, PenTool, Megaphone, Brain } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useCartStore } from '../store/cartStore';
import { useToast } from '../components/Toast';

export default function Marketplace() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem, items: cartItems } = useCartStore();
  const { showToast } = useToast();
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All'); // All, Free, Premium

  const categories = ['All', 'Technology', 'Business', 'Design', 'Marketing', 'Personal Development'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const categoryCards = [
    { name: 'Technology', icon: Code },
    { name: 'Business', icon: Briefcase },
    { name: 'Design', icon: PenTool },
    { name: 'Marketing', icon: Megaphone },
    { name: 'Personal Development', icon: Brain },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // In a real app, we might filter by published == true
        // For now, let's fetch all courses and we can filter client-side or add the published flag later
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const coursesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Mock price if not present
            price: data.price !== undefined ? data.price : (Math.random() > 0.3 ? 49.99 : 0)
          };
        });
        
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

  const handleAddToCart = (e: React.MouseEvent, course: any) => {
    e.preventDefault(); // Prevent navigating to course page
    if (cartItems.find(item => item.id === course.id)) {
      showToast('Course already in cart', 'info');
      return;
    }
    addItem({
      id: course.id,
      title: course.title,
      price: course.price || 0,
      thumbnail: `https://picsum.photos/seed/${course.id}/100/100`
    });
    showToast('Added to cart', 'success');
  };

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

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categoryCards.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(isSelected ? 'All' : cat.name)}
              className={`flex flex-col items-center p-6 rounded-2xl border transition-all duration-200 ${
                isSelected 
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-md scale-[1.02]' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="mb-3">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-center">{cat.name}</span>
            </button>
          );
        })}
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
              <div className="h-40 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${course.id}/400/200?grayscale`} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                {course.price && course.price > 0 && (
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 dark:text-white flex items-center shadow-sm">
                    <Shield className="w-3 h-3 mr-1" />
                    PRO
                  </div>
                )}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="bg-slate-900/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md border border-white/10 font-medium tracking-wide">
                    {course.category || 'General'}
                  </span>
                  <span className="bg-slate-900/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md border border-white/10 font-medium tracking-wide">
                    {course.difficulty || 'Beginner'}
                  </span>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-grow leading-relaxed">
                  {course.description || 'No description available.'}
                </p>
                
                {/* Card Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                  <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
                    <BookOpen className="w-4 h-4 mr-1.5" />
                    {course.chapters?.length || 0} Chapters
                  </div>
                  <div className="flex items-center text-slate-700 dark:text-slate-300">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                    <span className="text-sm font-bold">
                      {course.rating ? course.rating.toFixed(1) : 'New'}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-lg font-display font-bold text-slate-900 dark:text-white">
                    {course.price > 0 ? `$${course.price.toFixed(2)}` : 'Free'}
                  </span>
                  <button 
                    onClick={(e) => handleAddToCart(e, course)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 rounded-lg transition-colors flex items-center justify-center"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
