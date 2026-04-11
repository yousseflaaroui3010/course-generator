import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Play, CheckCircle2, Clock, Loader2, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LearningPaths() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed'>('in-progress');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch user's progress
        const progressSnap = await getDocs(collection(db, 'users', user.uid, 'progress'));
        const progressData = progressSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const coursesWithProgress = [];

        for (const prog of progressData) {
          const courseRef = doc(db, 'courses', prog.courseId || prog.id);
          const courseSnap = await getDoc(courseRef);
          
          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            const totalChapters = courseData.chapters?.length || 1;
            const completedChapters = prog.lastChapterIndex !== undefined ? prog.lastChapterIndex + 1 : 0;
            const progressPercentage = prog.completed ? 100 : Math.min(100, Math.round((completedChapters / totalChapters) * 100));

            coursesWithProgress.push({
              id: courseSnap.id,
              ...courseData,
              progress: progressPercentage,
              lastAccessed: prog.updatedAt || null
            });
          }
        }

        // Sort by last accessed (descending)
        coursesWithProgress.sort((a, b) => {
          const dateA = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
          const dateB = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
          return dateB - dateA;
        });

        setCourses(coursesWithProgress);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, `users/${user?.uid}/progress`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const inProgressCourses = courses.filter(c => c.progress < 100);
  const completedCourses = courses.filter(c => c.progress === 100);
  
  // Find the most recently accessed course that is not completed
  const recentCourse = inProgressCourses.length > 0 ? inProgressCourses[0] : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">My Learning</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Track your progress and continue where you left off.</p>
      </div>

      {/* Continue Learning Banner */}
      {recentCourse && (
        <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-800 dark:border-slate-700">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-slate-800 dark:bg-slate-700 opacity-50 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">Jump back in</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">{recentCourse.title}</h2>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex-1 max-w-xs bg-slate-800 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${recentCourse.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-300">{recentCourse.progress}% Complete</span>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/course/${recentCourse.id}`)}
              className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:bg-slate-100 hover:scale-105 transition-all flex items-center flex-shrink-0"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'in-progress'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            In Progress ({inProgressCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'completed'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            Completed ({completedCourses.length})
          </button>
        </nav>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'in-progress' ? inProgressCourses : completedCourses).length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No courses found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {activeTab === 'in-progress' 
                ? "You haven't started any courses yet. Head to Discover to find something new!" 
                : "You haven't completed any courses yet. Keep learning!"}
            </p>
            {activeTab === 'in-progress' && (
              <button 
                onClick={() => navigate('/discover')}
                className="mt-6 px-6 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
              >
                Browse Courses
              </button>
            )}
          </div>
        ) : (
          (activeTab === 'in-progress' ? inProgressCourses : completedCourses).map(course => (
            <div 
              key={course.id} 
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <div className="h-40 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${course.id}/400/200?grayscale`} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                {activeTab === 'completed' && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                    <Award className="w-3 h-3 mr-1" />
                    Completed
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                
                <div className="mt-auto pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {activeTab === 'completed' ? '100% Complete' : `${course.progress}% Complete`}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {course.chapters?.length || 0} Lessons
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${activeTab === 'completed' ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-slate-100'}`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
