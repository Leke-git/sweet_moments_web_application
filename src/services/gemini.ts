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

export const generateCakeVisualMockup = async (details: MockupDetails) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  try {
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
      parts.push({
        inlineData: {
          data: details.inspirationImage.data,
          mimeType: details.inspirationImage.mimeType,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Visual Mockup AI failed:", error);
    return null;
  }
};

export const explainCakeTerm = async (term: string, category: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  try {
    const prompt = `You are a professional artisan baker. Briefly explain what "${term}" is in the context of a cake's "${category}". 
    Keep the explanation under 30 words, elegant, and helpful for someone who isn't a baker. 
    Focus on the sensory experience (taste/texture/look).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Explanation AI failed:", error);
    return "A premium selection for your bespoke cake.";
  }
};
