import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Initialize Gemini AI
// process.env.GEMINI_API_KEY is automatically injected by the platform in the frontend
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * Wraps raw L16 PCM data in a WAV header to make it playable by standard audio tags.
 * @param base64Pcm The base64 encoded raw PCM data (L16, mono).
 * @param sampleRate The sample rate (e.g., 24000).
 * @returns A base64 encoded WAV file.
 */
function wrapPcmInWav(base64Pcm: string, sampleRate: number): string {
  const binary = atob(base64Pcm);
  const dataSize = binary.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataSize, true); // ChunkSize
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt subchunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, 1, true); // NumChannels (Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample

  // data subchunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true); // Subchunk2Size

  // Write PCM data
  const uint8View = new Uint8Array(buffer, 44);
  for (let i = 0; i < dataSize; i++) {
    uint8View[i] = binary.charCodeAt(i);
  }

  // Convert buffer back to base64 using a more efficient method
  const bytes = new Uint8Array(buffer);
  let binaryStr = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binaryStr += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
  }
  return btoa(binaryStr);
}

/**
 * Attempts to repair a truncated JSON string by closing open quotes, brackets, and braces.
 */
function repairJson(json: string): string {
  let repaired = json.trim();
  
  // If it's already valid, return it
  try {
    JSON.parse(repaired);
    return repaired;
  } catch (e) {}

  // 1. Fix unterminated strings
  // Count unescaped quotes
  let inString = false;
  for (let i = 0; i < repaired.length; i++) {
    if (repaired[i] === '"' && (i === 0 || repaired[i-1] !== '\\')) {
      inString = !inString;
    }
  }
  if (inString) {
    repaired += '"';
  }

  // 2. Close open brackets and braces
  const stack: string[] = [];
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    if (char === '"' && (i === 0 || repaired[i-1] !== '\\')) {
      // Skip strings
      let j = i + 1;
      while (j < repaired.length && (repaired[j] !== '"' || repaired[j-1] === '\\')) {
        j++;
      }
      i = j;
      continue;
    }
    if (char === '{' || char === '[') {
      stack.push(char);
    } else if (char === '}' || char === ']') {
      stack.pop();
    }
  }

  while (stack.length > 0) {
    const last = stack.pop();
    // Remove trailing comma before closing
    repaired = repaired.trim();
    if (repaired.endsWith(',')) {
      repaired = repaired.slice(0, -1);
    }
    if (last === '{') repaired += '}';
    if (last === '[') repaired += ']';
  }

  return repaired;
}

export const geminiService = {
  async generateCourse(sourceText: string, level: string, tone: string, options: any) {
    const isImage = sourceText.startsWith('IMAGE_DATA:');
    let contents: any[] = [];

    if (isImage) {
      const parts = sourceText.split(':');
      const mimeType = parts[1];
      const base64Data = parts[2];
      contents = [
        {
          role: 'user',
          parts: [
            { text: `Create a structured educational course based on the provided image. 
              Target Audience Level: ${level}
              Tone: ${tone}
              Include Quizzes: ${options.quizzes}
              
              CRITICAL REQUIREMENTS:
              - Limit the course to exactly 3-5 chapters.
              - Each chapter MUST have a unique 'id', 'title', and 'content'.
              - The 'content' field MUST be concise Markdown (max 400 words). Use headings and bullet points.
              - If 'quizzes' is true, each chapter MUST have a 'quiz' array with 3 questions.
              - If 'visuals' is true, each chapter MUST have 'visualMetadata' with a 'type' and 'prompt'.` },
            { inlineData: { mimeType, data: base64Data } }
          ]
        }
      ];
    } else {
      const prompt = `Create a structured educational course based on the following source material.
        Target Audience Level: ${level}
        Tone: ${tone}
        Include Quizzes: ${options.quizzes}
        
        CRITICAL REQUIREMENTS:
        - Limit the course to exactly 3-5 chapters.
        - Each chapter MUST have a unique 'id', 'title', and 'content'.
        - The 'content' field MUST be concise Markdown (max 400 words). Use headings and bullet points.
        - If 'quizzes' is true, each chapter MUST have a 'quiz' array with 3 questions.
        - If 'visuals' is true, each chapter MUST have 'visualMetadata' with a 'type' and 'prompt'.
        
        EXAMPLE STRUCTURE:
        {
          "title": "Course Title",
          "chapters": [
            {
              "id": "ch1",
              "title": "Chapter 1",
              "content": "Markdown content...",
              "visualMetadata": { "type": "image", "prompt": "Description..." },
              "quiz": [{ "question": "...", "options": ["...", "..."], "correctAnswerIndex": 0 }]
            }
          ]
        }
        
        Source Material:
        ${sourceText.substring(0, 20000)}
        `;
      contents = [{ role: 'user', parts: [{ text: prompt }] }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction: `You are an expert instructional designer specializing in accessible education. 
        Your task is to transform any provided source material (text or image) into a high-quality, structured educational course. 
        
        ACCESSIBILITY GUIDELINES (Dyslexic & ADHD Friendly):
        1. Use short, punchy sentences and active voice.
        2. Break text into very small paragraphs (max 3 sentences).
        3. Use bullet points and numbered lists extensively to chunk information.
        4. Bold key terms and important concepts to help with scanning.
        5. Use a clear, logical hierarchy with descriptive headings.
        6. Avoid long blocks of uninterrupted text.
        7. Be concise and focused. 
        
        COURSE STRUCTURE:
        - Even if the source material is brief or just an image, you must expand upon the core concepts to create a comprehensive learning experience. 
        - You MUST return exactly 3-5 chapters. 
        - Each chapter MUST have a title, concise markdown content (max 400 words), and visual metadata. 
        - If the source is very short, use your internal knowledge to flesh out the chapters while staying true to the original topic.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "chapters"],
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "title", "content", "visualMetadata"],
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING, description: "Concise Markdown content (max 400 words). Use headings and lists." },
                  visualMetadata: {
                    type: Type.OBJECT,
                    required: ["type", "prompt"],
                    description: "Metadata for generating a visual representation of this chapter.",
                    properties: {
                      type: { type: Type.STRING, enum: ["image", "chart", "diagram"], description: "The type of visual that best suits this content." },
                      chartType: { type: Type.STRING, enum: ["bar", "pie", "line"], description: "If type is 'chart', specify the chart style." },
                      prompt: { type: Type.STRING, description: "A detailed prompt for an image generator or a description for a diagram." },
                      chartData: { 
                        type: Type.ARRAY, 
                        description: "If type is 'chart', provide a simple array of objects with 'name' and 'value' for a bar/pie chart.",
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            value: { type: Type.NUMBER }
                          }
                        }
                      }
                    }
                  },
                  quiz: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["question", "options", "correctAnswerIndex"],
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

    const text = response.text;
    if (!text) throw new Error('AI returned an empty response');
    
    try {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        // Attempt to repair truncated JSON
        const repaired = repairJson(text);
        parsed = JSON.parse(repaired);
      }
      
      // Validation and normalization
      if (!parsed.title) parsed.title = "Untitled Course";
      if (!parsed.chapters || !Array.isArray(parsed.chapters)) {
        parsed.chapters = [];
      }
      
      // Ensure each chapter has the required fields
      parsed.chapters = parsed.chapters.map((ch: any, idx: number) => ({
        id: ch.id || `chapter-${idx + 1}`,
        title: ch.title || `Chapter ${idx + 1}`,
        content: ch.content || "Content coming soon...",
        visualMetadata: ch.visualMetadata || { type: 'image', prompt: ch.title || 'Educational illustration' },
        quiz: Array.isArray(ch.quiz) ? ch.quiz : []
      }));

      if (parsed.chapters.length === 0) {
        throw new Error('AI failed to generate any chapters. Please try a different source or prompt.');
      }

      return parsed;
    } catch (e: any) {
      console.error('Failed to parse AI JSON response:', e);
      console.log('Raw response start:', text.substring(0, 500));
      console.log('Raw response end:', text.substring(text.length - 500));
      
      // Attempt to fix common truncation issues (closing brackets)
      if (e.message.includes('unterminated string') || e.message.includes('Unexpected end of JSON input')) {
        throw new Error('The AI response was too long and got truncated. Please try a smaller source or a more specific prompt.');
      }
      throw e;
    }
  },

  async rewriteContent(content: string, level: string, tone: string) {
    const prompt = `Rewrite the following educational content to be suitable for a ${level} audience, using a ${tone} tone. 
    
    ACCESSIBILITY GUIDELINES (Dyslexic & ADHD Friendly):
    1. Use short, punchy sentences and active voice.
    2. Break text into very small paragraphs (max 3 sentences).
    3. Use bullet points and numbered lists extensively to chunk information.
    4. Bold key terms and important concepts to help with scanning.
    5. Use a clear, logical hierarchy with descriptive headings.
    6. Avoid long blocks of uninterrupted text.
    7. Be concise and focused.
    
    Content to rewrite:
    ${content}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text;
  },

  async generateAudio(text: string, voiceName: string = 'Puck') {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this educational content clearly: ${text.substring(0, 2000)}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName
            }
          }
        }
      }
    });
    
    const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Data) return null;

    // The Gemini TTS returns raw PCM (L16, 24kHz, mono).
    // To make it playable in a standard <audio> tag, we wrap it in a WAV header.
    return wrapPcmInWav(base64Data, 24000);
  },

  async generateImage(prompt: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) return null;
      
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    } catch (error) {
      console.error('Gemini Image Generation Error:', error);
    }
    return null;
  },

  async extendCourse(sourceText: string, existingChapterTitles: string[]) {
    const prompt = `Based on the following source material, generate 3-5 ADDITIONAL chapters that have NOT been covered yet. 
    
    EXISTING CHAPTERS (DO NOT REPEAT THESE):
    ${existingChapterTitles.join(', ')}
    
    Source Material:
    ${sourceText.substring(0, 20000)}
    `;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction: `You are an expert instructional designer specializing in accessible education. 
        Your task is to generate ADDITIONAL chapters for an existing course. 
        
        ACCESSIBILITY GUIDELINES (Dyslexic & ADHD Friendly):
        1. Use short, punchy sentences and active voice.
        2. Break text into very small paragraphs (max 3 sentences).
        3. Use bullet points and numbered lists extensively to chunk information.
        4. Bold key terms and important concepts to help with scanning.
        5. Use a clear, logical hierarchy with descriptive headings.
        6. Avoid long blocks of uninterrupted text.
        7. Be concise and focused. 
        
        COURSE STRUCTURE:
        - Generate exactly 3-5 NEW chapters. 
        - Each chapter MUST have a title, concise markdown content (max 400 words), and visual metadata. 
        - Ensure these chapters build logically upon the existing ones without repeating content.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ["chapters"],
          properties: {
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "title", "content", "visualMetadata"],
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING, description: "Concise Markdown content (max 400 words). Use headings and lists." },
                  visualMetadata: {
                    type: Type.OBJECT,
                    required: ["type", "prompt"],
                    description: "Metadata for generating a visual representation of this chapter.",
                    properties: {
                      type: { type: Type.STRING, enum: ["image", "chart", "diagram"], description: "The type of visual that best suits this content." },
                      chartType: { type: Type.STRING, enum: ["bar", "pie", "line"], description: "If type is 'chart', specify the chart style." },
                      prompt: { type: Type.STRING, description: "A detailed prompt for an image generator or a description for a diagram." },
                      chartData: { 
                        type: Type.ARRAY, 
                        description: "If type is 'chart', provide a simple array of objects with 'name' and 'value' for a bar/pie chart.",
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            value: { type: Type.NUMBER }
                          }
                        }
                      }
                    }
                  },
                  quiz: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["question", "options", "correctAnswerIndex"],
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

    const text = response.text;
    if (!text) throw new Error('AI returned an empty response');
    
    try {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        const repaired = repairJson(text);
        parsed = JSON.parse(repaired);
      }
      
      if (!parsed.chapters || !Array.isArray(parsed.chapters)) {
        throw new Error('AI failed to generate any chapters. Please try a different source or prompt.');
      }
      
      return parsed.chapters;
    } catch (err) {
      console.error('Failed to parse AI JSON response:', err);
      console.log('Raw AI response:', text);
      throw err;
    }
  },

  async generateVideoScript(prompt: string, style: string, voice: string, audience?: string, objectives?: string, criteria?: string[]) {
    const aiPrompt = `Create an educational video script based on: "${prompt}".
      Visual Style: ${style}
      Voice: ${voice}
      Target Audience: ${audience || 'General'}
      Learning Objectives: ${objectives || 'Not specified'}
      Acceptance Criteria: ${criteria?.join(', ') || 'None'}
      
      ACCESSIBILITY GUIDELINES (Dyslexic & ADHD Friendly):
      1. Use short, punchy sentences and active voice.
      2. Break narration into very small segments.
      3. Use clear, direct language.
      4. Avoid complex jargon unless explained simply.
      
      Break it down into exactly 3-5 scenes. Ensure each scene's narration is very concise (max 60 words).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: aiPrompt,
      config: {
        systemInstruction: `You are a professional video scriptwriter specializing in accessible educational content. 
        Your task is to create engaging, very concise scripts in JSON format that are Dyslexic and ADHD friendly.
        
        WRITING GUIDELINES:
        1. Use short, punchy sentences.
        2. Use clear, direct language.
        3. Break information into small, digestible chunks.
        
        Tailor the content for a ${audience || 'General'} audience. 
        Ensure the script meets these learning objectives: ${objectives || 'General education'}.
        Follow these criteria: ${criteria?.join(', ') || 'Standard educational format'}.
        Break it down into exactly 3-5 scenes. Ensure each scene's narration is very concise (max 60 words).`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "scenes"],
          properties: {
            title: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "narration", "visualDescription"],
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

    const text = response.text;
    if (!text) throw new Error('AI returned an empty response');
    
    try {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        // Attempt to repair truncated JSON
        const repaired = repairJson(text);
        parsed = JSON.parse(repaired);
      }
      
      // Validation and normalization
      if (!parsed.title) parsed.title = "Untitled Video";
      if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
        parsed.scenes = [];
      }
      
      parsed.scenes = parsed.scenes.map((s: any, idx: number) => ({
        id: s.id || `scene-${idx + 1}`,
        narration: s.narration || "No narration provided.",
        visualDescription: s.visualDescription || "No visual description provided."
      }));

      if (parsed.scenes.length === 0) {
        throw new Error('AI failed to generate any scenes. Please try a more specific prompt.');
      }

      return parsed;
    } catch (e: any) {
      console.error('Failed to parse AI JSON response:', e);
      if (e.message.includes('unterminated string') || e.message.includes('Unexpected end of JSON input')) {
        throw new Error('The AI response was too long and got truncated. Please try a more specific prompt.');
      }
      throw e;
    }
  }
};
