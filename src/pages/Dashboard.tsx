import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, PlayCircle, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import ConfirmationModal from '../components/ConfirmationModal';

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

    // Fetch Courses (Global for now, but could be filtered by creator or access)
    const coursesQuery = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const unsubCourses = onSnapshot(coursesQuery, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
      setLoading(false);
    });

    // Fetch Videos (Global for now)
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

  return (
    <div className="space-y-8">
      <ConfirmationModal
        isOpen={!!deleteModal?.isOpen}
        onClose={() => setDeleteModal(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteModal?.type === 'course' ? 'Course' : 'Video'}`}
        message={`Are you sure you want to delete this ${deleteModal?.type}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {profile?.displayName || 'Student'}</h1>
        <div className="flex space-x-4">
          <Link
            to="/build"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Continue Learning */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
              Continue Learning
            </h2>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <li className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </li>
            ) : courses.length === 0 ? (
              <li className="p-6 text-center text-gray-500 dark:text-gray-400">No courses generated yet.</li>
            ) : (
              courses.map((course) => (
                <li key={course.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <Link to={`/course/${course.id}`} className="block relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-md font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                        {(profile?.role === 'admin' || course.creatorId === user?.uid) && (
                          <button 
                            onClick={(e) => handleDeleteCourse(course.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{course.description}</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recent Videos */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <PlayCircle className="w-5 h-5 mr-2 text-rose-500" />
              Recent Videos
            </h2>
            {(profile?.role === 'teacher' || profile?.role === 'admin') && (
              <Link to="/studio" className="text-sm text-rose-600 hover:text-rose-500 font-medium">Go to Studio</Link>
            )}
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <li className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </li>
            ) : videos.length === 0 ? (
              <li className="p-6 text-center text-gray-500 dark:text-gray-400">No videos generated yet.</li>
            ) : (
              videos.map((video) => (
                <li key={video.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center relative overflow-hidden">
                      <PlayCircle className="w-8 h-8 text-white opacity-80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{video.title}</p>
                        {(profile?.role === 'admin' || video.creatorId === user?.uid) && (
                          <button 
                            onClick={(e) => handleDeleteVideo(video.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{video.status}</p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
