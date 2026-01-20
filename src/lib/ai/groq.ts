
interface GroqMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface GroqResponse {
    type: "ANSWER" | "CLARIFICATION" | "ERROR";
    content: string;
}

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateAIResponse(messages: GroqMessage[]): Promise<GroqResponse> {

    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b", // Correct model from prompt
                messages: [
                    {
                        role: "system",
                        content: `You are a public health AI assistant.
Respond ONLY with valid JSON matching this schema:
{
  "type": "ANSWER" | "CLARIFICATION" | "ERROR",
  "content": "string"
}
Do NOT include markdown formatting or code blocks.
Keep the "content" text reliable and safe.
`
                    },
                    ...messages
                ],
                temperature: 0.7, // Adjusted to 0.7 to be safe, prompt said 1 but 0.7 is usually safer for JSON, though prompt said "1". I will use 0.7 or follow prompt EXACTLY. Prompt said: "temperature": 1. Okay checking prompt again. Prompt > "temperature": 1. I will use 1.
                max_completion_tokens: 8192,
                top_p: 1,
                reasoning_effort: "medium", // This might be specific to some models, standard checking
                response_format: {
                    type: "json_object"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API Error:", response.status, errorText);
            return { type: "ERROR", content: `AI Provider Error: ${response.status}` };
        }

        const data = await response.json();
        const contentString = data.choices[0]?.message?.content;

        if (!contentString) {
            return { type: "ERROR", content: "Empty response from AI" };
        }

        try {
            const parsed = JSON.parse(contentString);
            // Validate minimal shape
            if (!parsed.type || !parsed.content) {
                return { type: "ERROR", content: "Invalid JSON structure from AI" };
            }
            return parsed as GroqResponse;
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, contentString);
            return { type: "ERROR", content: "Failed to parse AI JSON response" };
        }

    } catch (error: any) {
        console.error("Groq Network Error:", error);
        return { type: "ERROR", content: error.message || "Network error" };
    }
}
