import { describe, it, expect } from "vitest";
import { calculateTrustScore, calculateInputQuality } from "@/core/trustEngine";

describe("Trust Engine Logic", () => {
    it("should return HIGH quality for detailed text", () => {
        const text = "A very long and detailed symptom description that should definitely trigger high quality because it is over 150 characters long and provides lots of context for the AI.";
        expect(calculateInputQuality(text, false)).toBe("HIGH");
    });

    it("should return LOW quality for very short text", () => {
        expect(calculateInputQuality("My head hurts", false)).toBe("LOW");
    });

    it("should calculate high trust score (>= 0.9) for high confidence + high quality + validation", () => {
        const score = calculateTrustScore(0.95, "HIGH", true);
        // AI (0.95*0.5=0.475) + Qual (1.0*0.3=0.3) + Val (1.0*0.2=0.2) = 0.975
        expect(score).toBeGreaterThanOrEqual(0.9);
    });

    it("should fail trust gating (< 0.6) for low confidence and low quality", () => {
        const score = calculateTrustScore(0.4, "LOW", true);
        // AI (0.4*0.5=0.2) + Qual (0.3*0.3=0.09) + Val (1.0*0.2=0.2) = 0.49
        expect(score).toBeLessThan(0.6);
    });
});
