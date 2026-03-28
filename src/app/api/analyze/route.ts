import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { aiResponseSchema, inputSchema } from "@/lib/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const rawData = await req.json();
    
    // Sanitize and Validate User Input
    const parseResult = inputSchema.safeParse(rawData);
    if (!parseResult.success) {
       return NextResponse.json({ error: "Invalid input", details: parseResult.error }, { status: 400 });
    }
    
    const { text, image } = parseResult.data;

    const contents: any[] = [{
       role: "user",
       parts: [{ text: `Assess the following symptoms and determine the appropriate medical response. Symptoms: ${text}` }]
    }];

    // Add optional image processing
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
             possible_condition: { type: Type.STRING },
             recommended_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
             urgency: { type: Type.STRING, enum: ["LOW", "MEDIUM", "CRITICAL"] }
          },
          required: ["intent", "risk_level", "confidence", "possible_condition", "recommended_actions", "urgency"]
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
        console.error("Failed to parse AI output:", parseError);
        return NextResponse.json({ error: "AI produced invalid format" }, { status: 500 });
    }

  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
