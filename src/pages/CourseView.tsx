import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, CheckCircle, HelpCircle, Loader2, Wand2, Image as ImageIcon, BarChart3 } from 'lucide-react';
import Markdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts';
import { useToast } from '../components/Toast';
import { geminiService } from '../services/gemini';

export default function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('learn');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.warn('Auto-play blocked or failed:', err);
      });
    }
  }, [audioUrl]);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then(async res => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
        }
      })
      .then(data => {
        if (data.error) {
          showToast('Course not found', 'error');
          navigate('/');
        } else {
          setCourse(data);
        }
      })
      .catch(err => console.error(err));
  }, [courseId, navigate]);

  useEffect(() => {
    // Reset states when chapter changes
    setAudioUrl(null);
    setVisualUrl(null);
    setIsGeneratingVisual(false);

    const currentChapter = course?.chapters?.[activeChapterIndex];
    if (currentChapter?.visualMetadata?.type === 'image' && currentChapter.visualMetadata.prompt) {
      handleGenerateVisual(currentChapter.visualMetadata.prompt);
    }
  }, [activeChapterIndex, course]);

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

  const currentChapter = course.chapters[activeChapterIndex];

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };

  const handleNext = () => {
    if (activeChapterIndex < course.chapters.length - 1) {
      setActiveChapterIndex(activeChapterIndex + 1);
      setActiveTab('learn');
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  const handlePrev = () => {
    if (activeChapterIndex > 0) {
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
        const updatedCourse = {...course};
        updatedCourse.chapters[activeChapterIndex].content = rewrittenContent;
        setCourse(updatedCourse);
        showToast('Content rewritten successfully', 'success');
        
        // Save the updated course back to the backend
        await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCourse)
        });
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to rewrite content', 'error');
    } finally {
      setIsRewriting(false);
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
          <div className="mt-4 flex items-center">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.round((activeChapterIndex / course.chapters.length) * 100)}%` }}></div>
            </div>
            <span className="ml-3 text-xs font-medium text-gray-500 dark:text-gray-400">{Math.round((activeChapterIndex / course.chapters.length) * 100)}%</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Course Content</h3>
          <ul className="space-y-2">
            {course.chapters.map((chapter: any, index: number) => (
              <li key={chapter.id || index}>
                <button 
                  onClick={() => {
                    setActiveChapterIndex(index);
                    setActiveTab('learn');
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className={`w-full text-left px-3 py-3 rounded-lg flex items-start ${
                  index === activeChapterIndex ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/40' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                  <div className="mt-0.5 mr-3 flex-shrink-0">
                    {index < activeChapterIndex ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : index === activeChapterIndex ? (
                      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                    )}
                  </div>
                  <span className={`text-sm ${index === activeChapterIndex ? 'font-medium text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300'}`}>
                    {chapter.title}
                  </span>
                </button>
              </li>
            ))}
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
          </div>
          <div className="flex space-x-3">
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
            {activeTab === 'learn' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 prose prose-indigo dark:prose-invert max-w-none">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{currentChapter?.title}</h1>
                  <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    <Markdown>{currentChapter?.content || 'No content available.'}</Markdown>
                  </div>
                </div>
                
                <div className="lg:col-span-5 space-y-6">
                  {/* Visual Representation Section */}
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
                      ) : (
                        <div className="text-center p-8">
                          <ImageIcon className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                          <p className="text-sm text-gray-400">No visual representation available for this chapter.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary/Key Points Box */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30">
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wider mb-4">Key Takeaways</h4>
                    <ul className="space-y-3">
                      {currentChapter?.content?.split('\n').filter((l: string) => l.startsWith('- ')).slice(0, 4).map((point: string, i: number) => (
                        <li key={i} className="flex items-start text-sm text-indigo-800 dark:text-indigo-200">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 mr-3 flex-shrink-0"></div>
                          {point.replace('- ', '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
            disabled={activeChapterIndex === 0}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm px-4 py-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </button>
          <button 
            onClick={handleNext}
            disabled={activeChapterIndex === course.chapters.length - 1}
            className="flex items-center text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm px-6 py-2 rounded-lg shadow-sm disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
