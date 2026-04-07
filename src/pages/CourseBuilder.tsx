import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Settings, Wand2, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { geminiService } from '../services/gemini';

export default function CourseBuilder() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const [level, setLevel] = useState('Beginner');
  const [tone, setTone] = useState('Conversational & Engaging');
  const [options, setOptions] = useState({ quizzes: true, visuals: true, narration: false });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
        }

        if (data.fileId) {
          setFileId(data.fileId);
          setStep(2);
          showToast('File uploaded successfully', 'success');
        } else {
          showToast('Failed to upload file', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Error uploading file', 'error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Fake progress animation
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress > 90) currentProgress = 90;
      setProgress(currentProgress);
    }, 500);

    try {
      // 1. Get the source text from the backend
      const fileRes = await fetch(`/api/files/${fileId}`);
      if (!fileRes.ok) throw new Error('Failed to retrieve source text');
      const { text: sourceText } = await fileRes.json();

      // 2. Generate the course using Gemini in the frontend
      const courseData = await geminiService.generateCourse(sourceText, level, tone, options);
      
      if (!courseData || !courseData.chapters || !Array.isArray(courseData.chapters) || courseData.chapters.length === 0) {
        throw new Error('AI failed to generate a valid course structure. Please try again.');
      }

      // 3. Save the generated course to the backend
      const saveRes = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });
      
      const saveResult = await saveRes.json();
      
      clearInterval(interval);
      setProgress(100);
      
      if (saveResult.courseId) {
        showToast('Course generated successfully!', 'success');
        setTimeout(() => {
          navigate(`/course/${saveResult.courseId}`);
        }, 1000);
      } else {
        showToast('Failed to save generated course', 'error');
        setIsGenerating(false);
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Error: ${err.message || 'Failed to generate course'}`, 'error');
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Builder</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Transform documents into interactive learning experiences.</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Upload Source', icon: Upload },
            { num: 2, label: 'Configure', icon: Settings },
            { num: 3, label: 'Review', icon: CheckCircle2 }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step >= s.num ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500'
              }`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`mt-2 text-sm font-medium ${step >= s.num ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -z-10"></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 p-8">
        {step === 1 && (
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                accept=".pdf,.txt,.md"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="mx-auto h-12 w-12 text-indigo-500 animate-spin" />
              ) : (
                <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              )}
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {isUploading ? 'Uploading...' : 'Upload a document'}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">PDF, Markdown, or Plain Text up to 50MB</p>
            </div>
          </div>
        )}

        {step >= 2 && (
          <div className="space-y-6">
            <div className="flex items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
              <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-4" />
              <div>
                <p className="font-medium text-indigo-900 dark:text-indigo-100">{file?.name}</p>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">{((file?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience Level</label>
                <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                >
                  <option>Academic & Formal</option>
                  <option>Conversational & Engaging</option>
                  <option>Direct & Concise</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Generation Options</h4>
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={options.quizzes}
                  onChange={(e) => setOptions({...options, quizzes: e.target.checked})}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 dark:bg-gray-800 dark:border-gray-700" 
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Generate Quizzes & Assessments</span>
              </label>
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={options.visuals}
                  onChange={(e) => setOptions({...options, visuals: e.target.checked})}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 dark:bg-gray-800 dark:border-gray-700" 
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Include Visuals (Diagrams & Charts)</span>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating ({progress}%)
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Course
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
