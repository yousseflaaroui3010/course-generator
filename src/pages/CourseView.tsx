import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, CheckCircle, HelpCircle, Loader2, Wand2, Image as ImageIcon, BarChart3, Shield, FileText, Award, BookmarkPlus, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { geminiService } from '../services/gemini';
import AssignmentsTab from '../components/AssignmentsTab';
import CertificateModal from '../components/CertificateModal';

export default function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, profile } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(-1); // -1 for Overview
  const [activeTab, setActiveTab] = useState('learn');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.warn('Auto-play blocked or failed:', err);
      });
    }
  }, [audioUrl]);

  useEffect(() => {
    if (!courseId) return;

    const unsub = onSnapshot(doc(db, 'courses', courseId), (docSnap) => {
      if (docSnap.exists()) {
        setCourse({ id: docSnap.id, ...docSnap.data() });
      } else {
        showToast('Course not found', 'error');
        navigate('/');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `courses/${courseId}`);
    });

    return () => unsub();
  }, [courseId, navigate]);

  useEffect(() => {
    if (!user || !courseId) return;

    const progressRef = doc(db, 'users', user.uid, 'progress', courseId);
    getDoc(progressRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lastChapterIndex !== undefined) {
          setActiveChapterIndex(data.lastChapterIndex);
        }
      }
    }).catch(err => console.error('Failed to fetch progress:', err));
  }, [user, courseId]);

  useEffect(() => {
    // Reset states when chapter changes
    setAudioUrl(null);
    setVisualUrl(null);
    setIsGeneratingVisual(false);

    if (activeChapterIndex === -1) return;

    const currentChapter = course?.chapters?.[activeChapterIndex];
    if (currentChapter?.visualMetadata?.type === 'image' && currentChapter.visualMetadata.prompt) {
      const enhancedPrompt = `Educational illustration for: "${currentChapter.title}". 
        Description: ${currentChapter.visualMetadata.prompt}. 
        Style: Professional, clean, educational, high quality, suitable for a course.`;
      handleGenerateVisual(enhancedPrompt);
    }
  }, [activeChapterIndex, course]);

  useEffect(() => {
    if (!user || !courseId || activeChapterIndex === -1) return;

    const fetchNotes = async () => {
      try {
        const q = query(
          collection(db, 'users', user.uid, 'notes'),
          where('courseId', '==', courseId),
          where('chapterIndex', '==', activeChapterIndex)
        );
        const snap = await getDocs(q);
        setSavedNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Failed to fetch notes', error);
      }
    };

    fetchNotes();
  }, [user, courseId, activeChapterIndex]);

  const handleSaveNote = async () => {
    if (!user || !courseId || activeChapterIndex === -1 || !noteContent.trim()) return;
    
    setIsSavingNote(true);
    try {
      const noteData = {
        userId: user.uid,
        courseId,
        chapterIndex: activeChapterIndex,
        content: noteContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'notes'), noteData);
      setSavedNotes(prev => [{ id: docRef.id, ...noteData }, ...prev]);
      setNoteContent('');
      showToast('Note saved successfully', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/notes`);
      showToast('Failed to save note', 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleGenerateVisual = async (prompt: string) => {
    setIsGeneratingVisual(true);
    try {
      const imageData = await geminiService.generateImage(prompt);
      if (imageData) {
        setVisualUrl(`data:image/png;base64,${imageData}`);
      }
    } catch (err) {
      console.error('Failed to generate visual:', err);
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  useEffect(() => {
    if (user && course && activeChapterIndex >= 0 && activeChapterIndex < course.chapters.length) {
      const progressRef = doc(db, 'users', user.uid, 'progress', course.id);
      setDoc(progressRef, {
        courseId: course.id,
        userId: user.uid,
        lastChapterIndex: activeChapterIndex,
        updatedAt: new Date().toISOString(),
        completed: activeChapterIndex === course.chapters.length - 1
      }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/progress/${course.id}`));
    }
  }, [activeChapterIndex, course?.id, user]);

  if (!course || !course.chapters || !Array.isArray(course.chapters) || course.chapters.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] space-y-4">
        {!course ? (
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        ) : (
          <>
            <HelpCircle className="w-12 h-12 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invalid Course Data</h2>
            <p className="text-gray-500 dark:text-gray-400">This course appears to be empty or malformed.</p>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    );
  }

  const currentChapter = activeChapterIndex === -1 ? null : course.chapters[activeChapterIndex];

  const isPremium = course.price && course.price > 0;
  const hasAccess = !isPremium || (profile?.subscription?.status === 'active') || (profile?.role === 'admin') || (course.creatorId === user?.uid);

  if (!hasAccess && activeChapterIndex !== -1) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)] space-y-6 text-center px-4">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
          <Shield className="w-10 h-10 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Premium Content</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            This course is part of our Pro plan. Upgrade your account to get full access to all chapters, quizzes, and AI features.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate('/pricing')}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
          >
            Upgrade to Pro
          </button>
          <button 
            onClick={() => setActiveChapterIndex(-1)}
            className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all"
          >
            Back to Overview
          </button>
        </div>
      </div>
    );
  }

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const handleNext = () => {
    if (activeChapterIndex < course.chapters.length - 1) {
      setActiveChapterIndex(activeChapterIndex + 1);
      setActiveTab('learn');
      setQuizAnswers({});
      setQuizSubmitted(false);
    } else if (activeChapterIndex === course.chapters.length - 1) {
      // Move to completion state
      setActiveChapterIndex(course.chapters.length);
    }
  };

  const handlePrev = () => {
    if (activeChapterIndex > -1) {
      setActiveChapterIndex(activeChapterIndex - 1);
      setActiveTab('learn');
      setQuizAnswers({});
      setQuizSubmitted(false);
      setAudioUrl(null);
    }
  };

  const handleRewrite = async () => {
    setIsRewriting(true);
    try {
      const rewrittenContent = await geminiService.rewriteContent(
        currentChapter.content,
        'Advanced',
        'Engaging'
      );

      if (rewrittenContent) {
        const updatedChapters = [...course.chapters];
        updatedChapters[activeChapterIndex].content = rewrittenContent;
        
        // Save the updated course back to Firestore
        await updateDoc(doc(db, 'courses', course.id), {
          chapters: updatedChapters
        });
        
        setCourse({ ...course, chapters: updatedChapters });
        showToast('Content rewritten successfully', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to rewrite content', 'error');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleExtendCourse = async () => {
    if (!course.fileId) {
      showToast('Source material not found for this course', 'error');
      return;
    }

    setIsExtending(true);
    try {
      // 1. Fetch source text
      const fileRes = await fetch(`/api/files/${course.fileId}`);
      const fileData = await fileRes.json();
      if (!fileData.text) throw new Error('Failed to fetch source text');

      // 2. Generate more chapters
      const existingTitles = course.chapters.map((c: any) => (c.title));
      const newChapters = await geminiService.extendCourse(fileData.text, existingTitles);

      if (newChapters && newChapters.length > 0) {
        // Find current max batch index
        const maxBatchIndex = Math.max(...course.chapters.map((c: any) => c.batchIndex || 0));
        const chaptersWithBatch = newChapters.map((c: any) => ({ ...c, batchIndex: maxBatchIndex + 1 }));

        const updatedChapters = [...course.chapters, ...chaptersWithBatch];
        
        // 3. Save updated course to Firestore
        await updateDoc(doc(db, 'courses', course.id), {
          chapters: updatedChapters
        });

        setCourse({ ...course, chapters: updatedChapters });
        setActiveChapterIndex(course.chapters.length); // Start at the first new chapter
        showToast(`Added ${newChapters.length} new chapters!`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to extend course', 'error');
    } finally {
      setIsExtending(false);
    }
  };
  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    try {
      const audioData = await geminiService.generateAudio(currentChapter.content);

      if (audioData) {
        // Convert base64 to Blob for more reliable playback
        const binary = atob(audioData);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([array], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        // Clean up old URL if it exists
        if (audioUrl && audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrl);
        }
        
        setAudioUrl(url);
        showToast('Narration generated', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to generate audio', 'error');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{course.title}</h2>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Progress</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{Math.round((activeChapterIndex / course.chapters.length) * 100)}%</span>
            </div>
            <div className="flex h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              {(() => {
                const batches: Record<number, any[]> = {};
                course.chapters.forEach((chapter: any, index: number) => {
                  const bIdx = chapter.batchIndex || 0;
                  if (!batches[bIdx]) batches[bIdx] = [];
                  batches[bIdx].push(index);
                });

                return Object.entries(batches).sort(([a], [b]) => Number(a) - Number(b)).map(([batchIdx, chapterIndices], idx) => {
                  const batchSize = chapterIndices.length;
                  const totalSize = course.chapters.length;
                  const width = (batchSize / totalSize) * 100;
                  
                  const completedInBatch = chapterIndices.filter(i => i < activeChapterIndex).length;
                  let progressInBatch = (completedInBatch / batchSize) * 100;
                  
                  if (activeChapterIndex > Math.max(...chapterIndices)) {
                    progressInBatch = 100;
                  }

                  return (
                    <div 
                      key={batchIdx} 
                      className="h-full relative border-r border-white/20 dark:border-black/20 last:border-r-0" 
                      style={{ width: `${width}%` }}
                    >
                      <div 
                        className={`h-full transition-all duration-500 ${idx % 2 === 0 ? 'bg-indigo-600' : 'bg-indigo-400'}`}
                        style={{ width: `${progressInBatch}%` }}
                      ></div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Course Content</h3>
          <ul className="space-y-6">
            <li>
              <button 
                onClick={() => {
                  setActiveChapterIndex(-1);
                  setActiveTab('learn');
                }}
                className={`w-full text-left px-3 py-3 rounded-lg flex items-start ${
                activeChapterIndex === -1 ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/40' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
                <div className="mt-0.5 mr-3 flex-shrink-0">
                  <HelpCircle className={`w-5 h-5 ${activeChapterIndex === -1 ? 'text-indigo-500' : 'text-gray-400'}`} />
                </div>
                <span className={`text-sm ${activeChapterIndex === -1 ? 'font-medium text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300'}`}>
                  Course Overview
                </span>
              </button>
            </li>
            
            {/* Grouped Chapters */}
            {(() => {
              const batches: Record<number, any[]> = {};
              course.chapters.forEach((chapter: any, index: number) => {
                const bIdx = chapter.batchIndex || 0;
                if (!batches[bIdx]) batches[bIdx] = [];
                batches[bIdx].push({ ...chapter, originalIndex: index });
              });

              return Object.entries(batches).sort(([a], [b]) => Number(a) - Number(b)).map(([batchIdx, chapters]) => (
                <li key={batchIdx} className="space-y-2">
                  <div className="flex items-center px-3 mb-2">
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                    <span className="px-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      {batchIdx === '0' ? 'Initial Content' : `Extension ${batchIdx}`}
                    </span>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                  </div>
                  <ul className="space-y-1">
                    {chapters.map((chapter) => (
                      <li key={chapter.id || chapter.originalIndex}>
                        <button 
                          onClick={() => {
                            setActiveChapterIndex(chapter.originalIndex);
                            setActiveTab('learn');
                            setQuizAnswers({});
                            setQuizSubmitted(false);
                          }}
                          className={`w-full text-left px-3 py-3 rounded-lg flex items-start transition-all ${
                          chapter.originalIndex === activeChapterIndex 
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/40 shadow-sm' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}>
                          <div className="mt-0.5 mr-3 flex-shrink-0">
                            {chapter.originalIndex < activeChapterIndex ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : chapter.originalIndex === activeChapterIndex ? (
                              <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                            )}
                          </div>
                          <span className={`text-sm leading-tight ${chapter.originalIndex === activeChapterIndex ? 'font-bold text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300'}`}>
                            {chapter.title}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ));
            })()}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-8 py-4 flex justify-between items-center bg-white dark:bg-gray-900">
          <div className="flex space-x-6">
            <button 
              onClick={() => setActiveTab('learn')}
              className={`text-sm font-medium pb-4 -mb-4 border-b-2 ${activeTab === 'learn' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              Learn
            </button>
            {currentChapter?.quiz && currentChapter.quiz.length > 0 && (
              <button 
                onClick={() => setActiveTab('practice')}
                className={`text-sm font-medium pb-4 -mb-4 border-b-2 ${activeTab === 'practice' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                Practice
              </button>
            )}
            <button 
              onClick={() => setActiveTab('assignments')}
              className={`text-sm font-medium pb-4 -mb-4 border-b-2 ${activeTab === 'assignments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              Assignments
            </button>
          </div>
          <div className="flex space-x-3">
            {activeChapterIndex !== -1 && (
              <button 
                onClick={() => setShowNotes(!showNotes)}
                className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${showNotes ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800'}`}
              >
                <BookmarkPlus className="w-4 h-4 mr-1.5" />
                Notes
              </button>
            )}
            <button 
              onClick={handleRewrite}
              disabled={isRewriting}
              className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full disabled:opacity-50"
            >
              {isRewriting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1.5" />}
              Rewrite Content
            </button>
            <button 
              onClick={handleGenerateAudio}
              disabled={isGeneratingAudio}
              className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full disabled:opacity-50"
            >
              {isGeneratingAudio ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Play className="w-4 h-4 mr-1.5" />}
              Listen to Narration
            </button>
          </div>
        </div>

        {audioUrl && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 px-8 py-3 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">AI Narration</span>
            <audio ref={audioRef} controls src={audioUrl} className="h-8 w-full max-w-md" />
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            {activeChapterIndex === -1 ? (
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{course.title}</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    {course.description || "Welcome to this comprehensive learning experience. This course is designed to guide you through key concepts with interactive content and knowledge checks."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-2">Total Lessons</h3>
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{course.chapters.length}</p>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Structured modules</p>
                  </div>
                  <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/30">
                    <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">Quizzes</h3>
                    <p className="text-3xl font-black text-green-600 dark:text-green-400">
                      {course.chapters.filter((c: any) => c.quiz && c.quiz.length > 0).length}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">Knowledge checks</p>
                  </div>
                  <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">Est. Time</h3>
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{course.chapters.length * 10} min</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">To completion</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What you'll learn</h2>
                  <div className="space-y-10">
                    {(() => {
                      const batches: Record<number, any[]> = {};
                      course.chapters.forEach((chapter: any, index: number) => {
                        const bIdx = chapter.batchIndex || 0;
                        if (!batches[bIdx]) batches[bIdx] = [];
                        batches[bIdx].push({ ...chapter, originalIndex: index });
                      });

                      return Object.entries(batches).sort(([a], [b]) => Number(a) - Number(b)).map(([batchIdx, chapters]) => (
                        <div key={batchIdx} className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                              {batchIdx === '0' ? 'Foundation' : `Extension Pack ${batchIdx}`}
                            </span>
                            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            {chapters.map((chapter) => (
                              <div key={chapter.id || chapter.originalIndex} className="flex items-start p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                  {chapter.originalIndex + 1}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{chapter.title}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                    {chapter.content.substring(0, 150).replace(/[#*`]/g, '')}...
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <button 
                    onClick={() => setActiveChapterIndex(0)}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all transform hover:scale-105"
                  >
                    Start Learning Now
                  </button>
                </div>
              </div>
            ) : activeChapterIndex === course.chapters.length ? (
              <div className="max-w-2xl mx-auto text-center py-12 space-y-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-black text-gray-900 dark:text-white">Course Completed!</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Congratulations! You've finished all the generated lessons for this course.
                  </p>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">Claim Your Certificate</h3>
                    <p className="text-indigo-700 dark:text-indigo-300">
                      You've earned a certificate of completion for this course. You can download and share it on your professional networks.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowCertificate(true)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-700 flex items-center justify-center"
                  >
                    <Award className="w-6 h-6 mr-2" />
                    View & Download Certificate
                  </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Want to learn more?</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      There's still more content in your source material that hasn't been covered yet. I can generate additional chapters for you.
                    </p>
                  </div>
                  <button 
                    onClick={handleExtendCourse}
                    disabled={isExtending}
                    className="w-full py-4 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-2xl font-bold text-lg shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isExtending ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        Generating New Chapters...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-6 h-6 mr-2" />
                        Extend Course with More Content
                      </>
                    )}
                  </button>
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : activeTab === 'assignments' ? (
              <AssignmentsTab courseId={course.id} />
            ) : activeTab === 'learn' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                {(() => {
                  const hasSummary = currentChapter?.content?.split('\n').some((l: string) => l.trim().startsWith('- '));
                  const hasVisual = currentChapter?.visualMetadata?.type === 'chart' || isGeneratingVisual || visualUrl;
                  const showSidebar = hasVisual || hasSummary || showNotes;

                  return (
                    <>
                      <div className={`${showSidebar ? 'lg:col-span-7' : 'lg:col-span-12'} prose prose-indigo dark:prose-invert max-w-none dyslexic-friendly transition-all duration-300`}>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{currentChapter?.title}</h1>
                        <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          <Markdown>{currentChapter?.content || 'No content available.'}</Markdown>
                        </div>
                      </div>
                      
                      {showSidebar && (
                        <div className="lg:col-span-5 space-y-6">
                          {/* Notes Panel */}
                          {showNotes && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/50 overflow-hidden shadow-sm">
                              <div className="px-4 py-3 border-b border-amber-200 dark:border-amber-800/50 flex items-center justify-between bg-amber-100/50 dark:bg-amber-900/30">
                                <div className="flex items-center text-sm font-bold text-amber-900 dark:text-amber-300">
                                  <BookmarkPlus className="w-4 h-4 mr-2" />
                                  My Notes
                                </div>
                                <button onClick={() => setShowNotes(false)} className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="p-4 space-y-4">
                                <div>
                                  <textarea
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    placeholder="Add a note or highlight for this chapter..."
                                    className="w-full p-3 border border-amber-200 dark:border-amber-700/50 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500 text-sm"
                                    rows={3}
                                  />
                                  <div className="flex justify-end mt-2">
                                    <button
                                      onClick={handleSaveNote}
                                      disabled={isSavingNote || !noteContent.trim()}
                                      className="px-4 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center"
                                    >
                                      {isSavingNote ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                                      Save Note
                                    </button>
                                  </div>
                                </div>
                                
                                {savedNotes.length > 0 && (
                                  <div className="space-y-3 mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/50">
                                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Saved Notes</h4>
                                    {savedNotes.map(note => (
                                      <div key={note.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30 text-sm text-gray-700 dark:text-gray-300">
                                        {note.content}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Visual Representation Section */}
                          {hasVisual && (
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                                <div className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  {currentChapter?.visualMetadata?.type === 'chart' ? <BarChart3 className="w-4 h-4 mr-2 text-indigo-500" /> : <ImageIcon className="w-4 h-4 mr-2 text-indigo-500" />}
                                  Visual Representation
                                </div>
                              </div>
                              
                              <div className="p-4 min-h-[300px] flex items-center justify-center">
                                {currentChapter?.visualMetadata?.type === 'chart' && currentChapter.visualMetadata.chartData ? (
                                  <div className="w-full h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      {currentChapter.visualMetadata.chartType === 'pie' ? (
                                        <PieChart>
                                          <Pie 
                                            data={currentChapter.visualMetadata.chartData} 
                                            dataKey="value" 
                                            nameKey="name" 
                                            cx="50%" 
                                            cy="50%" 
                                            outerRadius={80} 
                                            label
                                          >
                                            {currentChapter.visualMetadata.chartData.map((_: any, index: number) => (
                                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                                            ))}
                                          </Pie>
                                          <Tooltip />
                                        </PieChart>
                                      ) : currentChapter.visualMetadata.chartType === 'line' ? (
                                        <LineChart data={currentChapter.visualMetadata.chartData}>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                          <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                          <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                          />
                                          <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                      ) : (
                                        <BarChart data={currentChapter.visualMetadata.chartData}>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                          <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                          <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                                          />
                                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {currentChapter.visualMetadata.chartData.map((_: any, index: number) => (
                                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                                            ))}
                                          </Bar>
                                        </BarChart>
                                      )}
                                    </ResponsiveContainer>
                                  </div>
                                ) : isGeneratingVisual ? (
                                  <div className="flex flex-col items-center text-gray-400">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    <span className="text-xs">Generating visual...</span>
                                  </div>
                                ) : visualUrl ? (
                                  <img 
                                    src={visualUrl} 
                                    alt="AI Generated Visual" 
                                    className="w-full h-auto rounded-lg shadow-sm object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : null}
                              </div>
                            </div>
                          )}

                          {/* Learning Outcome Box */}
                          <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-6 border border-green-100 dark:border-green-900/30">
                            <h4 className="text-sm font-bold text-green-900 dark:text-green-100 uppercase tracking-wider mb-2 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Learning Outcome
                            </h4>
                            <p className="text-sm text-green-800 dark:text-green-200">
                              By the end of this lesson, you will have mastered the core concepts of {currentChapter?.title} and be ready to apply them in practical scenarios.
                            </p>
                          </div>

                          {/* Summary/Key Points Box */}
                          {hasSummary && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30">
                              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wider mb-4">Key Takeaways</h4>
                              <ul className="space-y-3">
                                {currentChapter?.content?.split('\n').filter((l: string) => l.trim().startsWith('- ')).slice(0, 4).map((point: string, i: number) => (
                                  <li key={i} className="flex items-start text-sm text-indigo-800 dark:text-indigo-200">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 mr-3 flex-shrink-0"></div>
                                    {point.replace('- ', '').trim()}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* What's Next Box */}
                          {activeChapterIndex < course.chapters.length - 1 && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-900/30">
                              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 uppercase tracking-wider mb-2 flex items-center">
                                <ChevronRight className="w-4 h-4 mr-2" />
                                What's Next?
                              </h4>
                              <p className="text-sm text-amber-800 dark:text-amber-200">
                                Next up: <span className="font-bold">{course.chapters[activeChapterIndex + 1].title}</span>. We'll build upon what you've learned here.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Knowledge Check</h2>
                {currentChapter?.quiz?.map((q: any, qIndex: number) => (
                  <div key={qIndex} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm mb-6">
                    <p className="font-medium text-gray-900 dark:text-white mb-4">{qIndex + 1}. {q.question}</p>
                    <div className="space-y-3">
                      {q.options.map((opt: string, i: number) => {
                        const isSelected = quizAnswers[qIndex] === i;
                        const isCorrect = q.correctAnswerIndex === i;
                        
                        let optionClass = "flex items-center p-4 border rounded-lg cursor-pointer transition-colors ";
                        if (quizSubmitted) {
                          if (isCorrect) {
                            optionClass += "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100";
                          } else if (isSelected && !isCorrect) {
                            optionClass += "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100";
                          } else {
                            optionClass += "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-500 opacity-50";
                          }
                        } else {
                          optionClass += isSelected ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50";
                        }

                        return (
                          <label key={i} className={optionClass}>
                            <input 
                              type="radio" 
                              name={`q${qIndex}`} 
                              disabled={quizSubmitted}
                              checked={isSelected}
                              onChange={() => setQuizAnswers({...quizAnswers, [qIndex]: i})}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700" 
                            />
                            <span className="ml-3 dark:text-gray-200">{opt}</span>
                            {quizSubmitted && isCorrect && <CheckCircle className="w-5 h-5 ml-auto text-green-500" />}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {!quizSubmitted ? (
                  <button 
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length !== currentChapter?.quiz?.length}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <button 
                    onClick={handleNext}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    Continue to Next Lesson
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 flex justify-between items-center">
          <button 
            onClick={handlePrev}
            disabled={activeChapterIndex === -1}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm px-4 py-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </button>
          <button 
            onClick={handleNext}
            disabled={activeChapterIndex === course.chapters.length}
            className="flex items-center text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm px-6 py-2 rounded-lg shadow-sm disabled:opacity-50"
          >
            {activeChapterIndex === course.chapters.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
      
      {showCertificate && (
        <CertificateModal 
          courseTitle={course.title}
          issueDate={new Date().toISOString()}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}
