import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export const initializeGemini = () => {
  // In a real production build, process.env.API_KEY would be injected during build.
  // For this demo, we assume the environment is set up correctly.
  if (process.env.API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
};

export const summarizeInspiration = async (content: string, modelName: string = 'gemini-3-flash-preview'): Promise<string> => {
  if (!ai) {
    initializeGemini();
    if (!ai) {
        // Fallback or Error if no key available in env
        // Since we cannot ask user for key via UI as per system prompt, we return a mock or error.
        return "API Key not configured in environment. Please set process.env.API_KEY.";
    }
  }

  try {
    const response = await ai!.models.generateContent({
      model: modelName,
      contents: `Summarize this thought into a concise, tweet-style insight with 3 key takeaways formatted as a bulleted list:\n\n${content}`,
    });
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate summary.";
  }
};