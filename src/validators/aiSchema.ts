import { z } from "zod";

export const riskLevelEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const urgencyEnum = z.enum(["LOW", "MEDIUM", "CRITICAL"]);

export const aiResponseSchema = z.object({
  intent: z.string().describe("The primary intent of the user (e.g. assessing a symptom)"),
  risk_level: riskLevelEnum.describe("LOW, MEDIUM, or HIGH based on severity"),
  confidence: z.number().min(0).max(1).describe("Confidence score between 0.0 and 1.0"),
  reasoning: z.string().describe("A brief explanation for the decision"),
  possible_condition: z.string().describe("A brief, clear description of what might be happening"),
  recommended_actions: z.array(z.string()).describe("A list of clear, actionable steps for the user"),
  urgency: urgencyEnum.describe("Overall urgency: LOW, MEDIUM, or CRITICAL"),
});

export type AIResponse = z.infer<typeof aiResponseSchema>;

export const inputSchema = z.object({
  text: z.string().min(1, "Input text is required").max(1000, "Input is too long"),
  image: z.string().optional(),
});

export type UserInput = z.infer<typeof inputSchema>;
