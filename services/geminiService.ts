import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

// Initialize Gemini
// Note: In a real production app, API keys should not be exposed on the client side without restrictions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBookContent = async (title: string, author: string, sampleText: string): Promise<AIAnalysis> => {
  try {
    const prompt = `
      Analyse le début du livre suivant : "${title}" par ${author}.
      Voici un extrait du texte :
      "${sampleText.substring(0, 15000)}..." 
      
      Génère une analyse concise pour une quatrième de couverture (dos du livre).
      Je veux le résultat en format JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Un résumé captivant de 150 mots maximum en français." },
            themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 à 5 thèmes principaux." },
            readingLevel: { type: Type.STRING, description: "Niveau de lecture (ex: Facile, Intermédiaire, Avancé)." },
            mood: { type: Type.STRING, description: "L'ambiance générale du livre (ex: Sombre, Aventureux, Philosophique)." }
          },
          required: ["summary", "themes", "readingLevel", "mood"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysis;
    }
    
    throw new Error("Pas de réponse générée");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback if AI fails
    return {
      summary: "Résumé non disponible.",
      themes: ["Classique"],
      readingLevel: "Variable",
      mood: "Classique"
    };
  }
};