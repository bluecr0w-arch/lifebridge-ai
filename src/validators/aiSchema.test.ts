import { describe, it, expect } from "vitest";
import { aiResponseSchema } from "@/validators/aiSchema";

describe("Validation Logic", () => {
    const validData = {
        intent: "Assessment",
        risk_level: "LOW",
        confidence: 0.9,
        reasoning: "Reason",
        possible_condition: "Condition",
        recommended_actions: ["Action"],
        urgency: "LOW"
    };

    it("should pass validation for correctly formatted data", () => {
        const result = aiResponseSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it("should fail validation if reasoning is missing", () => {
        const { reasoning, ...invalidData } = validData;
        const result = aiResponseSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("should fail validation if risk_level is an invalid string", () => {
        const invalidData = { ...validData, risk_level: "CRITICAL" }; // only LOW | MEDIUM | HIGH allowed
        const result = aiResponseSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("should fail validation if confidence is out of bounds (e.g. 5)", () => {
        const invalidData = { ...validData, confidence: 5 };
        const result = aiResponseSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});
