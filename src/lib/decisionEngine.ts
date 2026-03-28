import { AIResponse } from "./schema";

export type DecisionState = "EMERGENCY" | "NORMAL";

export function evaluateDecision(aiResponse: AIResponse): DecisionState {
  // Rule: If risk_level = HIGH and confidence > 0.7 -> EMERGENCY
  if (aiResponse.risk_level === "HIGH" && aiResponse.confidence > 0.7) {
    return "EMERGENCY";
  }

  // Otherwise -> NORMAL
  return "NORMAL";
}
