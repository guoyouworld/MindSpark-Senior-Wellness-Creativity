import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ComicScript } from "../types";

// Initialize Default Gemini Client (used as fallback or for default Gemini calls)
// Note: We create new instances dynamically for custom keys, but keep this for env default.
const defaultAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Types ---

export interface ModelConfig {
  provider: 'gemini' | 'custom';
  baseUrl?: string; // For custom
  apiKey?: string;  // For custom (or override default)
  model: string;
}

export interface TextConfig extends ModelConfig {
  temperature: number;
  systemInstruction?: string;
}

export interface ImageConfig extends ModelConfig {
  style: string;
}

export interface AudioConfig extends ModelConfig {
  voice: string;
}

export interface Attachment {
  mimeType: string;
  data: string; // base64
}

// --- Helpers ---

const getGeminiClient = (apiKey?: string) => {
  return apiKey ? new GoogleGenAI({ apiKey }) : defaultAi;
};

// --- GENERIC TEXT GENERATION (New helper for non-comic usage) ---
export const generateText = async (
  prompt: string,
  config: TextConfig
): Promise<string> => {
  try {
    // --- CUSTOM OPENAI ---
    if (config.provider === 'custom') {
      if (!config.baseUrl || !config.apiKey || !config.model) {
        throw new Error("Custom Text configuration is missing (URL, Key, or Model).");
      }
      
      let endpoint = config.baseUrl.replace(/\/+$/, "");
      if (!endpoint.includes('/chat/completions')) endpoint += "/chat/completions";

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
             { role: "system", content: config.systemInstruction || "You are a helpful assistant." },
             { role: "user", content: prompt }
          ],
          temperature: config.temperature,
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    }
    // --- GEMINI ---
    else {
      const ai = getGeminiClient(config.apiKey);
      const response = await ai.models.generateContent({
        model: config.model,
        contents: { parts: [{ text: prompt }] },
        config: {
          temperature: config.temperature,
          systemInstruction: config.systemInstruction,
        }
      });
      return response.text || "";
    }
  } catch (error) {
    console.error("Text generation failed:", error);
    throw error;
  }
};

// --- 1. Text / Script Generation (Specialized for Comics) ---

export const generateComicScript = async (
  promptText: string,
  attachments: Attachment[],
  config: TextConfig
): Promise<ComicScript> => {
  
  const systemPrompt = `
    You are an expert educational comic book writer.
    Your task is to convert the provided content (text, images, or documents) into a 4-panel comic strip script.
    
    Goal: Make it easy to understand, educational, and engaging.
    
    Return a JSON object with a "title" (string) and "panels" (array of 4 objects).
    Each panel object must have:
    - "description": A detailed visual description for an AI image generator (English).
    - "dialogue": The character dialogue (Chinese, unless requested otherwise).
    
    Ensure the output is valid JSON.
  `;

  const finalPrompt = `${promptText ? `Additional Instructions/Context: "${promptText}"` : ''}`;

  try {
    let jsonString = '';

    // --- CUSTOM OPENAI (TEXT) ---
    if (config.provider === 'custom') {
      if (!config.baseUrl || !config.apiKey || !config.model) {
        throw new Error("Custom Text configuration is missing (URL, Key, or Model).");
      }

      const messages: any[] = [
        { role: "system", content: config.systemInstruction || systemPrompt },
      ];

      const userContent: any[] = [{ type: "text", text: finalPrompt + "\nIMPORTANT: Return ONLY JSON." }];

      // Attachments for OpenAI (Images only)
      attachments.forEach(att => {
        if (att.mimeType.startsWith('image/')) {
          userContent.push({
            type: "image_url",
            image_url: { url: `data:${att.mimeType};base64,${att.data}` }
          });
        } else {
          userContent.push({ 
            type: "text", 
            text: `[Attached File: ${att.mimeType} - Content extraction should be handled by client if not supported by model]` 
          });
        }
      });

      messages.push({ role: "user", content: userContent });

      let endpoint = config.baseUrl.replace(/\/+$/, "");
      if (!endpoint.includes('/chat/completions')) endpoint += "/chat/completions";

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: messages,
          temperature: config.temperature,
          response_format: { type: "json_object" } 
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Text API Error: ${response.status} - ${err}`);
      }
      const data = await response.json();
      jsonString = data.choices?.[0]?.message?.content || "";

    } 
    // --- GEMINI (TEXT) ---
    else {
      const ai = getGeminiClient(config.apiKey);
      const parts: any[] = [];
      
      attachments.forEach(att => {
        parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
      });
      parts.push({ text: systemPrompt });
      parts.push({ text: finalPrompt });

      const response = await ai.models.generateContent({
        model: config.model, // e.g. gemini-2.5-flash
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          temperature: config.temperature,
          systemInstruction: config.systemInstruction,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              panels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING },
                    dialogue: { type: Type.STRING },
                  },
                  required: ["description", "dialogue"],
                },
              },
            },
            required: ["title", "panels"],
          },
        },
      });
      jsonString = response.text || "";
    }

    if (!jsonString) throw new Error("No response content from AI");
    const cleanJson = jsonString.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson) as ComicScript;

  } catch (error) {
    console.error("Script generation failed:", error);
    throw error;
  }
};

// --- 2. Image Generation ---

export const generatePanelImage = async (
  description: string, 
  config: ImageConfig
): Promise<string> => {
  const prompt = `Comic panel, ${config.style}. ${description}. High quality, detailed. No text bubbles.`;

  try {
    // --- CUSTOM OPENAI (IMAGE) ---
    if (config.provider === 'custom') {
      if (!config.baseUrl || !config.apiKey || !config.model) throw new Error("Custom Image config missing.");
      
      let endpoint = config.baseUrl.replace(/\/+$/, "");
      if (!endpoint.includes('/images/generations')) endpoint += "/images/generations";

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model, // e.g., dall-e-3
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json"
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Image API Error: ${response.status} - ${err}`);
      }
      const data = await response.json();
      const b64 = data.data?.[0]?.b64_json;
      if (b64) return `data:image/png;base64,${b64}`;
      // Fallback for URL return type
      return data.data?.[0]?.url || "";
    }
    
    // --- GEMINI (IMAGE) ---
    else {
      const ai = getGeminiClient(config.apiKey);
      // Models: gemini-2.5-flash-image (Banana) or gemini-3-pro-image-preview (Banana Pro)
      // Check if user selected Imagen model or Nano Banana model
      const isImagen = config.model.includes('imagen');

      if (isImagen) {
         // Use generateImages for Imagen models
         const response = await ai.models.generateImages({
            model: config.model,
            prompt: prompt,
            config: {
              numberOfImages: 1,
              aspectRatio: '1:1',
              outputMimeType: 'image/jpeg'
            }
         });
         const b64 = response.generatedImages?.[0]?.image?.imageBytes;
         if (!b64) throw new Error("No image bytes returned from Imagen");
         return `data:image/jpeg;base64,${b64}`;
      } else {
         // Use generateContent for Nano Banana models
         const response = await ai.models.generateContent({
          model: config.model,
          contents: { parts: [{ text: prompt }] },
          config: {
            imageConfig: { aspectRatio: "1:1", imageSize: "1K" },
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        throw new Error("No image data in Gemini response");
      }
    }
  } catch (error) {
    console.error("Image generation failed:", error);
    return `https://placehold.co/600x600?text=Generation+Failed`; 
  }
};

// --- 3. Speech Generation (TTS) ---

export const generateSpeech = async (
  text: string,
  config: AudioConfig
): Promise<string | null> => {
  if (!text) return null;

  try {
    // --- CUSTOM OPENAI (AUDIO) ---
    if (config.provider === 'custom') {
       if (!config.baseUrl || !config.apiKey || !config.model) throw new Error("Custom Audio config missing.");

       let endpoint = config.baseUrl.replace(/\/+$/, "");
       if (!endpoint.includes('/audio/speech')) endpoint += "/audio/speech";

       const response = await fetch(endpoint, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${config.apiKey}`
         },
         body: JSON.stringify({
           model: config.model, // e.g. tts-1
           input: text,
           voice: config.voice || "alloy"
         })
       });

       if (!response.ok) throw new Error("Audio API Error");
       
       const blob = await response.blob();
       return URL.createObjectURL(blob);
    }
    // --- GEMINI (AUDIO) ---
    else {
      const ai = getGeminiClient(config.apiKey);
      const response = await ai.models.generateContent({
        model: config.model, // e.g., gemini-2.5-flash-preview-tts
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: config.voice || 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio data");
      
      return `base64:${base64Audio}`; 
    }
  } catch (error) {
    console.error("Speech generation failed", error);
    return null;
  }
};