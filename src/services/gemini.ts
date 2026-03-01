import { GoogleGenAI } from "@google/genai";

export interface MockupDetails {
  type: string;
  flavor: string;
  filling: string;
  frosting: string;
  message: string;
  inspirationImage?: {
    data: string; // Base64
    mimeType: string;
  };
}

const getApiKey = () => {
  // In Vite/Vercel browser environment, process.env is not available.
  // We check import.meta.env first, then fallback to a safe check for process.env
  let key = '';
  try {
    key = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  } catch (e) {}
  
  if (!key) {
    try {
      // Some environments might polyfill process.env
      key = (window as any).process?.env?.GEMINI_API_KEY || (window as any).process?.env?.VITE_GEMINI_API_KEY;
    } catch (e) {}
  }
  
  return key || '';
};

export const generateCakeVisualMockup = async (details: MockupDetails) => {
  console.log("Starting cake mockup generation...", details);
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in Vercel environment variables.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `A professional, high-end food photography shot of a ${details.type} cake. 
    Culinary Details: 
    - Base Flavour: ${details.flavor}
    - Filling: ${details.filling}
    - Frosting: ${details.frosting}
    - Custom Elements: ${details.message}
    
    Aesthetic Direction: Premium artisan bakery style, elegant presentation on a ceramic pedestal, soft natural morning light, magazine-quality, Ottolenghi aesthetic. 
    The photograph should look like a real, finished custom cake from a luxury bakery. 
    ${details.inspirationImage ? "Incorporate the visual style, color palette, or decorative spirit of the attached inspiration image into this specific cake type." : ""}
    Clean, minimalist background with soft neutral tones.`;

    const parts: any[] = [{ text: prompt }];

    if (details.inspirationImage) {
      console.log("Including inspiration image in prompt...");
      parts.push({
        inlineData: {
          data: details.inspirationImage.data,
          mimeType: details.inspirationImage.mimeType,
        },
      });
    }

    console.log("Calling Gemini API (gemini-2.5-flash-image)...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { 
        imageConfig: { 
          aspectRatio: "1:1" 
        } 
      }
    });

    console.log("Gemini API response received:", response);

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          console.log("Image data found in response!");
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    console.warn("Gemini returned a response but no image data was found in parts.");
    return null;
  } catch (error) {
    console.error("Gemini Visual Mockup AI failed:", error);
    return null;
  }
};

export const explainCakeTerm = async (term: string, category: string) => {
  const apiKey = getApiKey();
  if (!apiKey) return "A premium selection for your bespoke cake.";

  const ai = new GoogleGenAI({ apiKey });
  try {
    const prompt = `You are a professional artisan baker. Briefly explain what "${term}" is in the context of a cake's "${category}". 
    Keep the explanation under 30 words, elegant, and helpful for someone who isn't a baker. 
    Focus on the sensory experience (taste/texture/look).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "A premium selection for your bespoke cake.";
  } catch (error) {
    console.error("Gemini Explanation AI failed:", error);
    return "A premium selection for your bespoke cake.";
  }
};
