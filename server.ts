import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';
import { GoogleGenAI, Type } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Server starting. GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length);

setInterval(() => {
  fs.appendFileSync('key-length.log', `Periodic check. GEMINI_API_KEY length: ${process.env.GEMINI_API_KEY?.length}, starts with: ${process.env.GEMINI_API_KEY?.substring(0, 3)}\n`);
}, 1000);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// In-memory database for MVP
const db = {
  files: {} as Record<string, string>,
  courses: {} as Record<string, any>,
  videos: {} as Record<string, any>
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const upload = multer({ dest: 'uploads/' });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/stats', (req, res) => {
    res.json({
      users: 12345,
      courses: Object.keys(db.courses).length,
      videos: Object.keys(db.videos).length,
      generations: Object.keys(db.courses).length + Object.keys(db.videos).length
    });
  });

  app.get('/api/dashboard', (req, res) => {
    const courses = Object.values(db.courses).map((c: any) => ({
      id: c.id,
      title: c.title,
      progress: Math.floor(Math.random() * 100),
      lastAccessed: 'Just now'
    }));
    const videos = Object.values(db.videos).map((v: any) => ({
      id: v.id,
      title: v.title,
      duration: '1:30',
      status: 'ready'
    }));
    res.json({ courses, videos });
  });

  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      let text = '';
      if (req.file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        text = data.text;
      } else {
        text = fs.readFileSync(req.file.path, 'utf-8');
      }

      const fileId = uuidv4();
      db.files[fileId] = text;
      
      res.json({ 
        message: 'File uploaded and processed successfully', 
        fileId,
        originalName: req.file.originalname
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to process file' });
    }
  });

  app.post('/api/generate-course', async (req, res) => {
    try {
      console.log('Inside generate-course. GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length);
      const { fileId, level, tone, options } = req.body;
      const sourceText = db.files[fileId] || "General knowledge topic: " + fileId;

      const prompt = `Create a structured educational course based on the following source material.
      Target Audience Level: ${level}
      Tone: ${tone}
      Include Quizzes: ${options.quizzes}
      
      IMPORTANT: For the 'content' field of each chapter, write comprehensive Markdown. 
      Include pedagogical elements like:
      - Clear headings and bullet points
      - Callout boxes (using blockquotes >)
      - Visual explanation planning: Describe diagrams, concept maps, or charts that would help explain the concepts.
      
      Source Material:
      ${sourceText.substring(0, 30000)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              chapters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING, description: "Markdown content for the lesson. Include explanations, examples, and concept maps using markdown." },
                    quiz: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          question: { type: Type.STRING },
                          options: { type: Type.ARRAY, items: { type: Type.STRING } },
                          correctAnswerIndex: { type: Type.INTEGER }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const courseData = JSON.parse(response.text || '{}');
      const courseId = uuidv4();
      courseData.id = courseId;
      db.courses[courseId] = courseData;

      res.json({ courseId, message: 'Course generated successfully' });
    } catch (error: any) {
      console.error('Generate course error:', error);
      res.status(500).json({ error: 'Failed to generate course', details: error.message, keyLength: process.env.GEMINI_API_KEY?.length });
    }
  });

  app.get('/api/courses/:id', (req, res) => {
    const course = db.courses[req.params.id];
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  });

  app.post('/api/rewrite', async (req, res) => {
    try {
      const { content, level, tone } = req.body;
      const prompt = `Rewrite the following educational content to be suitable for a ${level} audience, using a ${tone} tone. Improve clarity, structure, and pedagogical value. Add a concept map or diagram description if helpful.\n\nContent:\n${content}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });
      
      res.json({ content: response.text });
    } catch (error) {
      console.error('Rewrite error:', error);
      res.status(500).json({ error: 'Failed to rewrite content' });
    }
  });

  app.post('/api/generate-audio', async (req, res) => {
    try {
      const { text, voiceName = 'Puck' } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: text.substring(0, 5000), // limit length for TTS
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      res.json({ audio: base64Audio });
    } catch (error) {
      console.error('Audio generation error:', error);
      res.status(500).json({ error: 'Failed to generate audio' });
    }
  });

  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
      });
      
      let base64Image = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
      
      res.json({ image: base64Image });
    } catch (error) {
      console.error('Image generation error:', error);
      res.status(500).json({ error: 'Failed to generate image' });
    }
  });

  app.post('/api/generate-video', async (req, res) => {
    try {
      const { prompt, style, voice } = req.body;

      const aiPrompt = `Create an educational video script based on: "${prompt}".
      Visual Style: ${style}
      Voice: ${voice}
      
      Break it down into 3-5 scenes.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: aiPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    narration: { type: Type.STRING },
                    visualDescription: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const videoData = JSON.parse(response.text || '{}');
      const videoId = uuidv4();
      videoData.id = videoId;
      db.videos[videoId] = videoData;

      res.json({ videoId, video: videoData });
    } catch (error) {
      console.error('Generate video error:', error);
      res.status(500).json({ error: 'Failed to generate video' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server Error:', err);
    if (req.path.startsWith('/api/')) {
      res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    } else {
      next(err);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
