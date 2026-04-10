import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Settings, Wand2, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { geminiService } from '../services/gemini';

export default function CourseBuilder() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const [level, setLevel] = useState('Beginner');
  const [tone, setTone] = useState('Conversational & Engaging');
  const [options, setOptions] = useState({ quizzes: true, visuals: true, narration: false });
  const [category, setCategory] = useState('Technology');
  const [price, setPrice] = useState<number>(0);
  const [published, setPublished] = useState(true);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreviewUrl(null);
      }

      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!res.ok) {
          if (res.status === 413) {
            throw new Error('File is too large. Please upload a smaller file.');
          }
          const text = await res.text();
          try {
            const errData = JSON.parse(text);
            throw new Error(errData.error || 'Upload failed');
          } catch (e) {
            throw new Error(`Upload failed with status ${res.status}. The file might be too large.`);
          }
        }
        
        const data = await res.json();

        if (data.fileId) {
          setFileId(data.fileId);
          setStep(2);
          showToast('File uploaded successfully', 'success');
        } else {
          throw new Error(data.error || 'Failed to upload file');
        }
      } catch (err: any) {
        console.error(err);
        showToast(err.message || 'Error uploading file', 'error');
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

      // Add batch index to initial chapters
      courseData.chapters = courseData.chapters.map((c: any) => ({ ...c, batchIndex: 0 }));

      // 3. Save the generated course to Firestore
      let docRef;
      try {
        docRef = await addDoc(collection(db, 'courses'), {
          ...courseData,
          creatorId: user?.uid,
          fileId,
          category,
          price,
          difficulty: level,
          published,
          rating: 0,
          createdAt: new Date().toISOString()
        });
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.CREATE, 'courses');
      }
      
      clearInterval(interval);
      setProgress(100);
      
      if (docRef && docRef.id) {
        showToast('Course generated successfully!', 'success');
        setTimeout(() => {
          navigate(`/course/${docRef.id}`);
        }, 1000);
      } else {
        showToast('Failed to save generated course', 'error');
        setIsGenerating(false);
      }
    } catch (err: any) {
      console.error(err);
      
      let errorMessage = err.message || 'Failed to generate course';
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        } else if (parsed.error && typeof parsed.error === 'string') {
          try {
            const nested = JSON.parse(parsed.error);
            if (nested.error && nested.error.message) {
              errorMessage = nested.error.message;
            } else {
              errorMessage = parsed.error;
            }
          } catch (e) {
            errorMessage = parsed.error;
          }
        }
      } catch (e) {
        // Not JSON
      }

      showToast(`Error: ${errorMessage}`, 'error');
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
                accept=".pdf,.txt,.md,image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="mx-auto h-12 w-12 text-indigo-500 animate-spin" />
              ) : previewUrl ? (
                <img src={previewUrl} alt="Preview" className="mx-auto h-32 w-auto rounded-lg shadow-md object-cover" referrerPolicy="no-referrer" />
              ) : (
                <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              )}
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {isUploading ? 'Uploading...' : previewUrl ? 'Image Selected' : 'Upload a document or photo'}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">PDF, Markdown, Text, or Images (JPG, PNG)</p>
            </div>
          </div>
        )}

        {step >= 2 && (
          <div className="space-y-6">
            <div className="flex items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
              {previewUrl ? (
                <img src={previewUrl} alt="File preview" className="w-12 h-12 rounded object-cover mr-4" referrerPolicy="no-referrer" />
              ) : (
                <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-4" />
              )}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                >
                  <option>Technology</option>
                  <option>Business</option>
                  <option>Design</option>
                  <option>Marketing</option>
                  <option>Personal Development</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                  placeholder="0.00 for Free"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Marketplace Settings</h4>
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 dark:bg-gray-800 dark:border-gray-700" 
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Publish to Marketplace immediately</span>
              </label>
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
