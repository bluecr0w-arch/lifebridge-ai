import { AIResponse } from "@/validators/aiSchema";

export type DecisionState = "EMERGENCY" | "NORMAL" | "UNCERTAIN";

/**
 * Evaluates the AI's response using a stricter safety logic.
 * If confidence is below a threshold, mark it as uncertain (ask for more detail).
 */
export function evaluateDecision(aiResponse: AIResponse): DecisionState {
  // Confidence Gating (CRITICAL SECURITY)
  if (aiResponse.confidence < 0.6) {
    return "UNCERTAIN";
  }

  // Rule: If risk_level = HIGH and confidence > 0.7 -> EMERGENCY
  if (aiResponse.risk_level === "HIGH" && aiResponse.confidence > 0.7) {
    return "EMERGENCY";
  }

  // Otherwise -> NORMAL
  return "NORMAL";
}

/**
 * Returns a human-friendly assessment based on the urgency level.
 */
export function getUrgencySummary(urgency: string): string {
    switch (urgency) {
        case "CRITICAL": return "🚨 Immediate medical assessment required.";
        case "MEDIUM": return "🟡 Urgent assessment recommended.";
        case "LOW": return "🟢 Low urgency, monitor symptoms.";
        default: return "⚪ Routine monitoring.";
    }
}
