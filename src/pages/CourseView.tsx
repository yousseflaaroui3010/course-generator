import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, CheckCircle, HelpCircle, Loader2, Wand2 } from 'lucide-react';
import Markdown from 'react-markdown';

export default function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('learn');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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
          alert('Course not found');
          navigate('/');
        } else {
          setCourse(data);
        }
      })
      .catch(err => console.error(err));
  }, [courseId, navigate]);

  if (!course) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
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
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: currentChapter.content,
          level: 'Advanced',
          tone: 'Engaging'
        })
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }

      if (data.content) {
        const updatedCourse = {...course};
        updatedCourse.chapters[activeChapterIndex].content = data.content;
        setCourse(updatedCourse);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to rewrite content');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    try {
      const res = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentChapter.content })
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }

      if (data.audio) {
        setAudioUrl(`data:audio/wav;base64,${data.audio}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-bold text-lg text-gray-900 leading-tight">{course.title}</h2>
          <div className="mt-4 flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.round((activeChapterIndex / course.chapters.length) * 100)}%` }}></div>
            </div>
            <span className="ml-3 text-xs font-medium text-gray-500">{Math.round((activeChapterIndex / course.chapters.length) * 100)}%</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Course Content</h3>
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
                  index === activeChapterIndex ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-100'
                }`}>
                  <div className="mt-0.5 mr-3 flex-shrink-0">
                    {index < activeChapterIndex ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : index === activeChapterIndex ? (
                      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>
                  <span className={`text-sm ${index === activeChapterIndex ? 'font-medium text-indigo-900' : 'text-gray-700'}`}>
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
        <div className="border-b border-gray-200 px-8 py-4 flex justify-between items-center bg-white">
          <div className="flex space-x-6">
            <button 
              onClick={() => setActiveTab('learn')}
              className={`text-sm font-medium pb-4 -mb-4 border-b-2 ${activeTab === 'learn' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Learn
            </button>
            {currentChapter?.quiz && currentChapter.quiz.length > 0 && (
              <button 
                onClick={() => setActiveTab('practice')}
                className={`text-sm font-medium pb-4 -mb-4 border-b-2 ${activeTab === 'practice' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Practice
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleRewrite}
              disabled={isRewriting}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-full disabled:opacity-50"
            >
              {isRewriting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1.5" />}
              Rewrite Content
            </button>
            <button 
              onClick={handleGenerateAudio}
              disabled={isGeneratingAudio}
              className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full disabled:opacity-50"
            >
              {isGeneratingAudio ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Play className="w-4 h-4 mr-1.5" />}
              Listen to Narration
            </button>
          </div>
        </div>

        {audioUrl && (
          <div className="bg-indigo-50 px-8 py-3 border-b border-indigo-100 flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-900">AI Narration</span>
            <audio controls src={audioUrl} className="h-8 w-full max-w-md" autoPlay />
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div className="max-w-3xl mx-auto">
            {activeTab === 'learn' ? (
              <div className="prose prose-indigo max-w-none space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">{currentChapter?.title}</h1>
                <div className="text-gray-800 leading-relaxed">
                  <Markdown>{currentChapter?.content || 'No content available.'}</Markdown>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Knowledge Check</h2>
                {currentChapter?.quiz?.map((q: any, qIndex: number) => (
                  <div key={qIndex} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                    <p className="font-medium text-gray-900 mb-4">{qIndex + 1}. {q.question}</p>
                    <div className="space-y-3">
                      {q.options.map((opt: string, i: number) => {
                        const isSelected = quizAnswers[qIndex] === i;
                        const isCorrect = q.correctAnswerIndex === i;
                        
                        let optionClass = "flex items-center p-4 border rounded-lg cursor-pointer transition-colors ";
                        if (quizSubmitted) {
                          if (isCorrect) {
                            optionClass += "bg-green-50 border-green-500 text-green-900";
                          } else if (isSelected && !isCorrect) {
                            optionClass += "bg-red-50 border-red-500 text-red-900";
                          } else {
                            optionClass += "border-gray-200 text-gray-500 opacity-50";
                          }
                        } else {
                          optionClass += isSelected ? "bg-indigo-50 border-indigo-500" : "border-gray-200 hover:bg-gray-50";
                        }

                        return (
                          <label key={i} className={optionClass}>
                            <input 
                              type="radio" 
                              name={`q${qIndex}`} 
                              disabled={quizSubmitted}
                              checked={isSelected}
                              onChange={() => setQuizAnswers({...quizAnswers, [qIndex]: i})}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" 
                            />
                            <span className="ml-3">{opt}</span>
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
        <div className="border-t border-gray-200 p-4 bg-white flex justify-between items-center">
          <button 
            onClick={handlePrev}
            disabled={activeChapterIndex === 0}
            className="flex items-center text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2 disabled:opacity-50"
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
