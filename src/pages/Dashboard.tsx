import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, PlayCircle, Plus, Trash2, Loader2, Star, Users } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { showToast } = useToast();
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, type: 'course' | 'video', id: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const coursesQuery = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const unsubCourses = onSnapshot(coursesQuery, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
      setLoading(false);
    });

    const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubVideos = onSnapshot(videosQuery, (snapshot) => {
      const videosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(videosData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
    });

    return () => {
      unsubCourses();
      unsubVideos();
    };
  }, [user]);

  const handleDeleteCourse = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ isOpen: true, type: 'course', id });
  };

  const handleDeleteVideo = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ isOpen: true, type: 'video', id });
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    const { type, id } = deleteModal;
    
    try {
      await deleteDoc(doc(db, `${type}s`, id));
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`, 'success');
      setDeleteModal(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${type}s/${id}`);
      showToast(`Failed to delete ${type}`, 'error');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 pb-12">
      <ConfirmationModal
        isOpen={!!deleteModal?.isOpen}
        onClose={() => setDeleteModal(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteModal?.type === 'course' ? 'Course' : 'Video'}`}
        message={`Are you sure you want to delete this ${deleteModal?.type}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {profile?.displayName?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Ready to continue your learning journey?</p>
        </div>
        <div className="flex space-x-4">
          <Link
            to="/build"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Continue Learning - Takes up 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
              Continue Learning
            </h2>
            <Link to="/paths" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center px-4">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No courses yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Get started by creating your first AI-generated course or exploring the marketplace.</p>
              <Link to="/build" className="mt-4 text-indigo-600 font-medium hover:underline">Create a course</Link>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {courses.map((course, index) => (
                <motion.div key={course.id} variants={itemVariants}>
                  <Link to={`/course/${course.id}`} className="group block h-full">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col h-full">
                      <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img 
                          src={`https://picsum.photos/seed/${course.id}/600/400`} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-md border border-white/20">
                            {course.category || 'Technology'}
                          </span>
                          {(profile?.role === 'admin' || course.creatorId === user?.uid) && (
                            <button 
                              onClick={(e) => handleDeleteCourse(course.id, e)}
                              className="p-1.5 bg-white/10 backdrop-blur-md text-white hover:bg-red-500/80 rounded-md transition-colors border border-white/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Recently'}
                          </div>
                          <div className="flex items-center text-xs font-medium text-amber-500">
                            <Star className="w-3.5 h-3.5 mr-1 fill-current" />
                            4.8
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Sidebar Column - Recent Videos & Stats */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center">
                <PlayCircle className="w-5 h-5 mr-2 text-rose-500" />
                Recent Videos
              </h2>
              {(profile?.role === 'teacher' || profile?.role === 'admin') && (
                <Link to="/studio" className="text-sm text-rose-600 hover:text-rose-500 font-medium">Studio</Link>
              )}
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <div className="p-6 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : videos.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No videos generated yet.</div>
              ) : (
                videos.slice(0, 4).map((video) => (
                  <div key={video.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group flex items-start space-x-4 cursor-pointer">
                    <div className="flex-shrink-0 w-20 h-14 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={`https://picsum.photos/seed/${video.id}/200/150`} 
                        alt="" 
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                        referrerPolicy="no-referrer"
                      />
                      <PlayCircle className="w-6 h-6 text-white relative z-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{video.title}</p>
                        {(profile?.role === 'admin' || video.creatorId === user?.uid) && (
                          <button 
                            onClick={(e) => handleDeleteVideo(video.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 capitalize flex items-center">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${video.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                        {video.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-600/20">
            <h3 className="text-lg font-display font-bold mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-indigo-100">Weekly Goal</span>
                  <span className="font-medium">4/5 hrs</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2 w-4/5"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-indigo-200 text-xs uppercase tracking-wider font-semibold mb-1">Completed</p>
                  <p className="text-2xl font-display font-bold">12</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-xs uppercase tracking-wider font-semibold mb-1">Certificates</p>
                  <p className="text-2xl font-display font-bold">3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
