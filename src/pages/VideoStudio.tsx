import { useState } from 'react';
import { Film, Wand2, Play, Download, Settings2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/Toast';
import { geminiService } from '../services/gemini';

export default function VideoStudio() {
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Minimalist Vector');
  const [voice, setVoice] = useState('Professional (Female)');
  const [audience, setAudience] = useState('University Student');
  const [objectives, setObjectives] = useState('');
  const [criteria, setCriteria] = useState<string[]>(['Include Summary', 'Use Analogies']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [sceneMedia, setSceneMedia] = useState<Record<string, { image?: string, audio?: string, loadingImage?: boolean, loadingAudio?: boolean }>>({});

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSceneMedia({});
    try {
      // 1. Generate the video script using Gemini in the frontend
      const videoData = await geminiService.generateVideoScript(prompt, style, voice, audience, objectives, criteria);
      
      if (!videoData || !videoData.scenes || !Array.isArray(videoData.scenes) || videoData.scenes.length === 0) {
        throw new Error('AI failed to generate a valid video script. Please try again.');
      }

      // 2. Save the generated video to the backend
      const saveRes = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData)
      });
      
      const saveResult = await saveRes.json();

      if (saveResult.videoId) {
        setVideoData(videoData);
        showToast('Video script generated!', 'success');
      } else {
        showToast('Failed to save video script', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error generating video', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSceneImage = async (sceneId: string, visualDescription: string) => {
    setSceneMedia(prev => ({ ...prev, [sceneId]: { ...prev[sceneId], loadingImage: true } }));
    try {
      const imageData = await geminiService.generateImage(`Visual style: ${style}. ${visualDescription}`);
      
      if (imageData) {
        setSceneMedia(prev => ({ ...prev, [sceneId]: { ...prev[sceneId], image: `data:image/jpeg;base64,${imageData}` } }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSceneMedia(prev => ({ ...prev, [sceneId]: { ...prev[sceneId], loadingImage: false } }));
    }
  };

  const generateSceneAudio = async (sceneId: string, narration: string) => {
    setSceneMedia(prev => ({ ...prev, [sceneId]: { ...prev[sceneId], loadingAudio: true } }));
    try {
      const audioData = await geminiService.generateAudio(
        narration, 
        voice.includes('Male') ? 'Fenrir' : 'Puck'
      );

      if (audioData) {
        setSceneMedia(prev => ({ ...prev, [sceneId]: { ...prev[sceneId], audio: `data:audio/wav;base64,${audioData}` } }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSceneMedia(prev => ({ ...prev, [sceneId]: { ...prev[sceneId], loadingAudio: false } }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Video Studio</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Generate educational videos from topics or course content.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Controls */}
        <div className={`space-y-6 transition-all duration-500 ease-in-out ${videoData || isGenerating ? 'lg:col-span-1' : 'lg:col-span-1 lg:col-start-2'}`}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Generation Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source Topic or Text</label>
                <textarea 
                  rows={4}
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border text-sm"
                  placeholder="E.g., Explain how photosynthesis works to a 5th grader..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visual Style</label>
                <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border text-sm"
                >
                  <option>Minimalist Vector</option>
                  <option>Chalkboard</option>
                  <option>3D Isometric</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voice</label>
                <select 
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border text-sm"
                >
                  <option>Professional (Female)</option>
                  <option>Energetic (Male)</option>
                  <option>Calm (Female)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
                <select 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border text-sm"
                >
                  <option>K-12 Student</option>
                  <option>University Student</option>
                  <option>Corporate Professional</option>
                  <option>General Public</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Learning Objectives</label>
                <textarea 
                  rows={2}
                  className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3 border text-sm"
                  placeholder="What should the user learn?"
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Acceptance Criteria</label>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { label: 'General', items: ['Include Summary', 'Use Analogies', 'Simple Language'] },
                    { label: 'Teacher', items: ['Include Assessment', 'Align with Curriculum', 'Provide Further Reading'] },
                    { label: 'Student', items: ['Focus on Exam Prep', 'Use Peer Language', 'Step-by-step Guide'] },
                    { label: 'Admin', items: ['Include Branding', 'Ensure Accessibility', 'Add Call to Action'] }
                  ].map((group) => (
                    <div key={group.label} className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{group.label}</span>
                      <div className="grid grid-cols-1 gap-1">
                        {group.items.map((item) => (
                          <label key={item} className="flex items-center space-x-2 cursor-pointer group">
                            <input 
                              type="checkbox"
                              checked={criteria.includes(item)}
                              onChange={(e) => {
                                if (e.target.checked) setCriteria([...criteria, item]);
                                else setCriteria(criteria.filter(c => c !== item));
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Script & Scenes...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Video
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <AnimatePresence>
          {(videoData || isGenerating) && (
            <motion.div 
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-2"
            >
              <div className="bg-gray-900 rounded-xl shadow-sm overflow-hidden aspect-video relative flex items-center justify-center">
                {isGenerating && !videoData && (
                  <div className="text-center text-white">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-medium">Generating scenes via AI...</p>
                    <p className="text-sm text-gray-400 mt-2">Crafting script and visual descriptions</p>
                  </div>
                )}

                {videoData && (
                  <div className="absolute inset-0 bg-gray-800 flex flex-col">
                    {/* Mock Video Player */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      <h2 className="text-2xl font-bold text-white mb-4">{videoData.title}</h2>
                      
                      {videoData.scenes?.map((scene: any, index: number) => {
                        const media = sceneMedia[scene.id] || {};
                        return (
                          <div key={scene.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col md:flex-row">
                            <div className="md:w-1/3 bg-gray-900 relative min-h-[150px] flex items-center justify-center border-r border-gray-700">
                              {media.image ? (
                                <img src={media.image} alt="Scene visual" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : media.loadingImage ? (
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                              ) : (
                                <div className="text-center p-4">
                                  <Film className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                  <button 
                                    onClick={() => generateSceneImage(scene.id, scene.visualDescription)}
                                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded"
                                  >
                                    Generate Image
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Scene {index + 1}</span>
                                </div>
                                <p className="text-sm text-gray-300 italic mb-3">"{scene.visualDescription}"</p>
                                <p className="text-base text-white">"{scene.narration}"</p>
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                                {media.audio ? (
                                  <audio controls src={media.audio} className="h-8 w-full max-w-[200px]" />
                                ) : media.loadingAudio ? (
                                  <span className="text-sm text-gray-400 flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Voice...</span>
                                ) : (
                                  <button 
                                    onClick={() => generateSceneAudio(scene.id, scene.narration)}
                                    className="text-xs flex items-center text-gray-300 hover:text-white"
                                  >
                                    <Play className="w-4 h-4 mr-1" /> Generate Voiceover
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Controls */}
                    <div className="h-12 bg-gray-900 px-4 flex items-center justify-between border-t border-gray-700">
                      <div className="flex items-center space-x-4">
                        <Play className="w-5 h-5 text-white cursor-pointer" />
                        <div className="w-64 h-1 bg-gray-700 rounded-full relative cursor-pointer">
                          <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full w-1/3"></div>
                        </div>
                        <span className="text-xs text-gray-400">0:00 / 1:20</span>
                      </div>
                      <div className="flex space-x-3">
                        <button className="text-gray-400 hover:text-white"><Settings2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {videoData && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{videoData.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{videoData.scenes?.length} Scenes • Generated just now</p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                      Edit Script
                    </button>
                    <button className="flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                      <Download className="w-4 h-4 mr-2" />
                      Export MP4
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
