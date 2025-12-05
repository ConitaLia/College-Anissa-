import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, QuizQuestion } from '../types';

// NOTE: Ideally, the API key should come from process.env.API_KEY.
// For this frontend-only demo, we assume the environment is set up correctly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateLeftoverRecipe = async (ingredients: string, lang: 'en' | 'id'): Promise<Recipe | null> => {
  const model = 'gemini-2.5-flash';
  
  const prompt = lang === 'en' 
    ? `Create a fun, simple, and tasty recipe using these leftovers: ${ingredients}. The recipe should be suitable for teenagers or young adults.` 
    : `Buatlah resep yang seru, sederhana, dan enak menggunakan sisa bahan ini: ${ingredients}. Resepnya harus cocok untuk remaja atau dewasa muda.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            emoji: { type: Type.STRING },
            ingredients: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as Recipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    return null;
  }
};

export const generateQuizQuestion = async (lang: 'en' | 'id'): Promise<QuizQuestion | null> => {
  const model = 'gemini-2.5-flash';
  
  const prompt = lang === 'en'
    ? "Generate a fun trivia question about food waste, recycling, or sustainability for teenagers."
    : "Buatlah pertanyaan trivia yang seru tentang sampah makanan, daur ulang, atau keberlanjutan untuk remaja.";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
            },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as QuizQuestion;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return null;
  }
};
