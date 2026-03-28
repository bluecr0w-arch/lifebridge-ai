import { describe, it, expect } from "vitest";
import { evaluateDecision } from "@/core/decisionEngine";
import { AIResponse } from "@/validators/aiSchema";

describe("Decision Engine Logic", () => {
    const mockBaseResponse: AIResponse = {
        intent: "Assessment",
        risk_level: "LOW",
        confidence: 0.9,
        reasoning: "Test reasoning",
        possible_condition: "Mock condition",
        recommended_actions: ["Action 1"],
        urgency: "LOW"
    };

    it("should return NORMAL for low risk and high confidence", () => {
        const result = evaluateDecision(mockBaseResponse);
        expect(result).toBe("NORMAL");
    });

    it("should return EMERGENCY for high risk and high confidence", () => {
        const response: AIResponse = { ...mockBaseResponse, risk_level: "HIGH", confidence: 0.85 };
        const result = evaluateDecision(response);
        expect(result).toBe("EMERGENCY");
    });

    it("should return UNCERTAIN if confidence is below threshold (0.6)", () => {
        const response: AIResponse = { ...mockBaseResponse, confidence: 0.5 };
        const result = evaluateDecision(response);
        expect(result).toBe("UNCERTAIN");
    });

    it("should return NORMAL for high risk but medium confidence (<= 0.7)", () => {
        const response: AIResponse = { ...mockBaseResponse, risk_level: "HIGH", confidence: 0.65 };
        const result = evaluateDecision(response);
        expect(result).toBe("NORMAL"); // Gating logic: needs > 0.7 for EMERGENCY
    });
});
