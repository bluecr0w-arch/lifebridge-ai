import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { aiResponseSchema, inputSchema } from "@/validators/aiSchema";
import { sanitizeInput, isSafeToProcess } from "@/security/sanitizer";

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

    // 2. Sanitize against Injection & Suspect patterns
    if (!isSafeToProcess(text)) {
        return NextResponse.json({ error: "Input contains suspicious or invalid patterns." }, { status: 403 });
    }
    
    const sanitizedText = sanitizeInput(text);

    // 3. Prepare Prompt for Gemini (Strict context)
    const prompt = `
        You are an expert medical triage assistant called LifeBridge AI.
        Your goal is to assess user-provided symptoms and provide a risk assessment and recommended actions.
        
        Symptom data: ${sanitizedText}
        
        RULES:
        1. Never provide a final diagnosis. Speak in terms of 'possible conditions' and 'assessment'.
        2. If the symptoms are vague, set confidence lower.
        3. If there is chest pain, difficulty breathing, or heavy bleeding, priority must be HIGH.
        4. Do NOT hallucinate medical advice.
        5. Return only valid JSON according to the provided schema.
    `;

    const contents: any[] = [{
       role: "user",
       parts: [{ text: prompt }]
    }];

    if (image) {
      const base64Data = image.split(",")[1];
      const mimeType = image.split(";")[0].split(":")[1];
      
      contents[0].parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
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
        const parsedOutput = JSON.parse(aiOutputText);
        // Validating the output strongly via Zod against our schema
        const validatedOutput = aiResponseSchema.parse(parsedOutput);
        
        return NextResponse.json({ result: validatedOutput });
    } catch (parseError) {
        console.error("AI output validation failed:", parseError);
        return NextResponse.json({ error: "AI response failed strict validation checks." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("API Analyze Route Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during symptom analysis." }, { status: 500 });
  }
}
