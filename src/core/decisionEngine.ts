import { AIResponse } from "@/validators/aiSchema";

export type DecisionState = "EMERGENCY" | "NORMAL" | "UNCERTAIN";

/**
 * Final Medical Decision: Uses the combined Trust Score instead of raw AI confidence.
 */
export function evaluateDecision(aiResponse: AIResponse, trustScore: number): DecisionState {
  // Trust Gating (CRITICAL SAFETY)
  if (trustScore < 0.6) {
    return "UNCERTAIN";
  }

  // EMERGENCY Rule: HIGH risk and high reliability
  if (aiResponse.risk_level === "HIGH" && trustScore > 0.7) {
    return "EMERGENCY";
  }

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
