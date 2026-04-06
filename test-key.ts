import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: 'Hello'
    });
    console.log('Success:', response.text);
  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

test();
