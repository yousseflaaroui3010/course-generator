import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Plus, Loader2, Trash2, Edit2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function LearningPaths() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [paths, setPaths] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create/Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPath, setEditingPath] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseIds: [] as string[]
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all learning paths
        const pathsSnap = await getDocs(collection(db, 'learningPaths'));
        setPaths(pathsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch all courses to populate selection
        const coursesSnap = await getDocs(collection(db, 'courses'));
        setCourses(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'learningPaths/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenModal = (path: any = null) => {
    if (path) {
      setEditingPath(path);
      setFormData({
        title: path.title,
        description: path.description,
        courseIds: path.courseIds || []
      });
    } else {
      setEditingPath(null);
      setFormData({ title: '', description: '', courseIds: [] });
    }
    setIsModalOpen(true);
  };

  const handleToggleCourse = (courseId: string) => {
    setFormData(prev => {
      const isSelected = prev.courseIds.includes(courseId);
      if (isSelected) {
        return { ...prev, courseIds: prev.courseIds.filter(id => id !== courseId) };
      } else {
        return { ...prev, courseIds: [...prev.courseIds, courseId] };
      }
    });
  };

  const handleSave = async () => {
    if (!formData.title || formData.courseIds.length === 0) {
      showToast('Please provide a title and select at least one course', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const pathData = {
        title: formData.title,
        description: formData.description,
        courseIds: formData.courseIds,
        creatorId: user?.uid,
        createdAt: editingPath ? editingPath.createdAt : new Date().toISOString()
      };

      if (editingPath) {
        await updateDoc(doc(db, 'learningPaths', editingPath.id), pathData);
        setPaths(paths.map(p => p.id === editingPath.id ? { id: p.id, ...pathData } : p));
        showToast('Learning path updated', 'success');
      } else {
        const docRef = await addDoc(collection(db, 'learningPaths'), pathData);
        setPaths([{ id: docRef.id, ...pathData }, ...paths]);
        showToast('Learning path created', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'learningPaths');
      showToast('Failed to save learning path', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this learning path?')) return;
    try {
      await deleteDoc(doc(db, 'learningPaths', id));
      setPaths(paths.filter(p => p.id !== id));
      showToast('Learning path deleted', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'learningPaths');
      showToast('Failed to delete', 'error');
    }
  };

  const getCourseDetails = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Paths</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Curated sequences of courses to help you master a topic.</p>
        </div>
        {(profile?.role === 'teacher' || profile?.role === 'admin') && (
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Path
          </button>
        )}
      </div>

      {paths.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Learning Paths Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Learning paths group multiple courses together to form a comprehensive curriculum.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {paths.map(path => (
            <div key={path.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{path.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{path.description}</p>
                </div>
                {(profile?.role === 'admin' || (profile?.role === 'teacher' && path.creatorId === user?.uid)) && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleOpenModal(path)}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(path.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Courses in this path</h3>
                <div className="space-y-4">
                  {path.courseIds.map((courseId: string, index: number) => {
                    const course = getCourseDetails(courseId);
                    if (!course) return null;
                    
                    return (
                      <div key={courseId} className="flex items-center p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{course.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{course.description}</p>
                        </div>
                        <button 
                          onClick={() => navigate(`/course/${course.id}`)}
                          className="ml-4 p-3 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 rounded-full shadow-sm hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Play className="w-5 h-5 ml-0.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingPath ? 'Edit Learning Path' : 'Create Learning Path'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Path Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Frontend Developer Bootcamp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="What will students achieve?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Courses (in order)</label>
                <div className="space-y-2 border border-gray-200 dark:border-gray-700 rounded-xl p-2 max-h-64 overflow-y-auto">
                  {courses.map(course => {
                    const isSelected = formData.courseIds.includes(course.id);
                    const orderIndex = formData.courseIds.indexOf(course.id);
                    
                    return (
                      <div 
                        key={course.id}
                        onClick={() => handleToggleCourse(course.id)}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded border flex items-center justify-center mr-3 ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <span className="text-xs font-bold">{orderIndex + 1}</span>}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-white'}`}>
                            {course.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-800/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center font-medium"
              >
                {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                Save Path
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
