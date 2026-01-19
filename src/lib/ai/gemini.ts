
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

function getClient() {
    if (model) return model;

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY is missing in environment variables.");
    }

    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
    return model;
}

interface GenerationOptions {
    temperature?: number;
    maxOutputTokens?: number;
}

/**
 * Generates text using Google Gemini.
 */
export async function generateText(prompt: string, options: GenerationOptions = {}): Promise<string> {
    try {
        const aiModel = getClient();
        const result = await aiModel.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: options.temperature ?? 0.2, // Low temp for factual/observational
                maxOutputTokens: options.maxOutputTokens ?? 500,
            },
        });

        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        throw new Error("Failed to generate content from AI engine.");
    }
}

/**
 * Generates JSON output. 
 * Note: Gemini Pro doesn't enforce JSON mode strictly like OpenAI, so we prompt heavily for it 
 * and try to parse. reliable parsing handles potential markdown fences.
 */
export async function generateJSON<T>(prompt: string): Promise<T> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown formatting, no code blocks.`;

    try {
        const text = await generateText(jsonPrompt, { temperature: 0.1 });
        // Strip code fences if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText) as T;
    } catch (error) {
        console.error("Gemini JSON Error:", error);
        throw new Error("Failed to generate valid JSON from AI engine.");
    }
}
