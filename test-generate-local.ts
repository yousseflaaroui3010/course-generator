import { GoogleGenAI, Type } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const db = {
  files: { test: 'General knowledge topic: test' },
  courses: {} as Record<string, any>,
  videos: {} as Record<string, any>
};

async function test() {
  try {
    const fileId = 'test';
    const level = 'Beginner';
    const tone = 'Conversational';
    const options = { quizzes: true };
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

    console.log({ courseId, message: 'Course generated successfully' });
  } catch (error) {
    console.error('Generate course error:', error);
  }
}

test();
