import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with the API key
// In a real app, this should be in an environment variable
// For this demo, we'll check if the key exists
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

export const getGeminiResponse = async (
    message: string,
    context: {
        currentMood?: string;
        soulNoteContent?: string;
        timeOfDay: string;
    }
): Promise<string> => {
    if (!model) {
        console.warn("Gemini API Key not found. Falling back to default responses.");
        return ""; // Return empty to signal fallback
    }

    try {
        const prompt = `
      You are "Mama Lucerna", a warm, loving, and motherly AI assistant. 
      Your goal is to provide emotional support, comfort, and gentle advice to the user, whom you call "honey", "sweetheart", "darling", or "my child".
      
      Context:
      - Time of day: ${context.timeOfDay}
      - User's current mood: ${context.currentMood || "Unknown"}
      - Recent journal entry: ${context.soulNoteContent || "None"}

      User message: "${message}"

      Instructions:
      - Respond in a warm, motherly tone.
      - Be empathetic and validating.
      - Offer gentle advice if appropriate, but prioritize emotional support.
      - Keep responses concise (under 3 sentences) but meaningful.
      - Use emojis like 💖, 🫂, 🌸, ✨ to convey warmth.
      - If the user mentions self-harm or suicide, strictly provide a supportive message urging them to seek professional help immediately, but do NOT try to be a therapist.
      
      Response:
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return ""; // Return empty to signal fallback
    }
};
