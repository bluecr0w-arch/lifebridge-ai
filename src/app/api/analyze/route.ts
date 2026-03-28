import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { aiResponseSchema, inputSchema } from "@/validators/aiSchema";
import { sanitizeInput, classifyInputSafety } from "@/security/sanitizer";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const rawData = await req.json();
    
    // 1. Validate Input Structure via Zod
    const parseResult = inputSchema.safeParse(rawData);
    if (!parseResult.success) {
       return NextResponse.json({ error: "Invalid input format", details: parseResult.error }, { status: 400 });
    }
    
    const { text, image } = parseResult.data;

    // 2. Classify and Sanitize Input (Early Exit if BLOCKED)
    const { status, reason } = classifyInputSafety(text);
    
    // Log the event for security monitoring
    if (status !== "SAFE") {
        console.warn(`[SECURITY EVENT] Input Status: ${status} | Reason: ${reason} | Input: ${text.substring(0, 50)}...`);
    }

    if (status === "BLOCKED") {
        return NextResponse.json({ 
            error: "We could not process your request due to safety or relevance concerns.", 
            details: reason,
            safetyStatus: status 
        }, { status: 403 });
    }
    
    const sanitizedText = sanitizeInput(text);

    // 3. Prepare Prompt for Gemini
    const prompt = `
        You are an expert medical triage assistant called LifeBridge AI.
        Symptom data: ${sanitizedText}
        Output strictly in JSON.
    `;

    const contents: any[] = [{
       role: "user",
       parts: [{ text: prompt }]
    }];

    if (image) {
      const base64Data = image.split(",")[1];
      const mimeType = image.split(";")[0].split(":")[1];
      contents[0].parts.push({
        inlineData: { data: base64Data, mimeType: mimeType }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             intent: { type: Type.STRING },
             risk_level: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
             confidence: { type: Type.NUMBER },
             reasoning: { type: Type.STRING },
             possible_condition: { type: Type.STRING },
             recommended_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
             urgency: { type: Type.STRING, enum: ["LOW", "MEDIUM", "CRITICAL"] }
          },
          required: ["intent", "risk_level", "confidence", "reasoning", "possible_condition", "recommended_actions", "urgency"]
        }
      }
    });

    const aiOutputText = response.text || "{}";
    
    try {
        const validatedOutput = aiResponseSchema.parse(JSON.parse(aiOutputText));
        // Return results along with safety metadata
        return NextResponse.json({ 
            result: validatedOutput,
            safetyStatus: status 
        });
    } catch (parseError) {
        console.error("AI output validation failed:", parseError);
        return NextResponse.json({ error: "AI response failed strict validation checks." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("API Analyze Route Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during symptom analysis." }, { status: 500 });
  }
}
