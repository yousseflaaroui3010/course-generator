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
import * as dotenv from 'dotenv';
import Stripe from 'stripe';

// Load environment variables from .env file
dotenv.config();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn('STRIPE_SECRET_KEY is not set. Payments will not work.');
    return null;
  }
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' });
}

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI
function getAI() {
  // Use CUSTOM_GEMINI_API_KEY if provided, otherwise fall back to the platform's GEMINI_API_KEY
  const key = process.env.CUSTOM_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn('No Gemini API key is set. AI features will not work.');
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
}

// In-memory database for MVP
interface AppDatabase {
  files: Record<string, string>;
  courses: Record<string, any>;
  videos: Record<string, any>;
}

const db: AppDatabase = {
  files: {},
  courses: {},
  videos: {}
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log('Starting server initialization...');

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory');
  }

  const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit to prevent OOM crashes
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
    const courses = Object.values(db.courses).map((c: any) => {
      const totalChapters = c.chapters?.length || 0;
      const completedCount = c.completedChapters?.length || 0;
      const progress = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
      
      // Group chapters by batch for the dashboard to show "Extension" info
      const batches: Record<number, number> = {};
      c.chapters?.forEach((ch: any) => {
        const bIdx = ch.batchIndex || 0;
        batches[bIdx] = (batches[bIdx] || 0) + 1;
      });

      return {
        id: c.id,
        title: c.title,
        progress,
        batchCount: Object.keys(batches).length,
        lastAccessed: 'Just now'
      };
    });
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
      } else if (req.file.mimetype.startsWith('image/')) {
        const dataBuffer = fs.readFileSync(req.file.path);
        text = `IMAGE_DATA:${req.file.mimetype}:${dataBuffer.toString('base64')}`;
      } else {
        text = fs.readFileSync(req.file.path, 'utf-8');
      }

      const fileId = uuidv4();
      db.files[fileId] = text;
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
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

  app.get('/api/files/:id', (req, res) => {
    const text = db.files[req.params.id];
    if (!text) return res.status(404).json({ error: 'File not found' });
    res.json({ text });
  });

  app.post('/api/courses', (req, res) => {
    const courseData = req.body;
    const courseId = courseData.id || uuidv4();
    courseData.id = courseId;
    db.courses[courseId] = courseData;
    res.json({ courseId, message: 'Course saved successfully' });
  });

  app.post('/api/videos', (req, res) => {
    const videoData = req.body;
    const videoId = videoData.id || uuidv4();
    videoData.id = videoId;
    db.videos[videoId] = videoData;
    res.json({ videoId, message: 'Video saved successfully' });
  });

  app.post('/api/generate-course', async (req, res) => {
    res.status(410).json({ error: 'This endpoint is deprecated. Use frontend generation.' });
  });

  app.get('/api/courses/:id', (req, res) => {
    const course = db.courses[req.params.id];
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  });

  app.post('/api/courses/:id/progress', (req, res) => {
    const { chapterIndex } = req.body;
    const course = db.courses[req.params.id];
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    if (!course.completedChapters) course.completedChapters = [];
    if (!course.completedChapters.includes(chapterIndex)) {
      course.completedChapters.push(chapterIndex);
    }
    
    res.json({ message: 'Progress updated', completedChapters: course.completedChapters });
  });

  app.delete('/api/courses/:id', (req, res) => {
    if (db.courses[req.params.id]) {
      delete db.courses[req.params.id];
      res.json({ message: 'Course deleted successfully' });
    } else {
      res.status(404).json({ error: 'Course not found' });
    }
  });

  app.delete('/api/videos/:id', (req, res) => {
    if (db.videos[req.params.id]) {
      delete db.videos[req.params.id];
      res.json({ message: 'Video deleted successfully' });
    } else {
      res.status(404).json({ error: 'Video not found' });
    }
  });

  app.post('/api/admin/clear-all', (req, res) => {
    db.files = {};
    db.courses = {};
    db.videos = {};
    res.json({ message: 'All data cleared' });
  });

  // AI Routes
  app.post('/api/ai/generate', async (req, res) => {
    const { model, contents, config, systemInstruction } = req.body;
    const aiClient = getAI();
    
    if (!aiClient) {
      return res.status(500).json({ error: 'AI is not configured on the server' });
    }

    try {
      const requestConfig: any = { ...config };
      if (systemInstruction) {
        requestConfig.systemInstruction = systemInstruction;
      }

      const response = await aiClient.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents,
        config: requestConfig
      });
      
      res.json(response);
    } catch (error: any) {
      console.error('AI generation error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate content' });
    }
  });

  // Stripe Routes
  app.post('/api/create-payment-intent', async (req, res) => {
    const { amount, courseId, userId } = req.body;
    const stripeClient = getStripe();
    
    if (!stripeClient) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    try {
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: { courseId, userId },
        automatic_payment_methods: { enabled: true },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/create-checkout-session', async (req, res) => {
    const { priceId, userId } = req.body;
    const stripeClient = getStripe();

    if (!stripeClient) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    try {
      const session = await stripeClient.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${req.headers.origin}/settings?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing`,
        metadata: { userId },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const stripeClient = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeClient || !webhookSecret || !sig) {
      return res.status(400).send('Webhook Error: Missing configuration');
    }

    let event;

    try {
      event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event (In a real app, you'd update Firestore here)
    // For now, we just log it.
    console.log('Stripe Event:', event.type);

    res.json({ received: true });
  });

  app.post('/api/rewrite', async (req, res) => {
    res.status(410).json({ error: 'This endpoint is deprecated. Use frontend generation.' });
  });

  app.post('/api/generate-audio', async (req, res) => {
    res.status(410).json({ error: 'This endpoint is deprecated. Use frontend generation.' });
  });

  app.post('/api/generate-image', async (req, res) => {
    res.status(410).json({ error: 'This endpoint is deprecated. Use frontend generation.' });
  });

  app.post('/api/generate-video', async (req, res) => {
    res.status(410).json({ error: 'This endpoint is deprecated. Use frontend generation.' });
  });

  // Catch-all for API routes to prevent falling through to SPA fallback
  app.all('/api/*', (req, res) => {
    console.warn(`API route not found: ${req.method} ${req.path}`);
    res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
  });

  // Global error handler for API routes
  app.use('/api/*', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Server Error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      plugins: [
        {
          name: 'architectural-hmr-fix',
          transformIndexHtml(html) {
            return html.replace(/<script type="module" src="\/@vite\/client"><\/script>/g, '');
          }
        }
      ],
      server: { 
        middlewareMode: true,
        hmr: false,
        watch: {
          usePolling: true,
          interval: 1000,
        }
      },
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
      if (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File is too large. Maximum size is 10MB.' });
      }
      res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    } else {
      next(err);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
