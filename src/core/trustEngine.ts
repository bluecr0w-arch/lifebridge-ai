import { AIResponse } from "@/validators/aiSchema";

export type InputQuality = "LOW" | "MEDIUM" | "HIGH";

/**
 * Calculates the quality of the user input based on length and detail.
 */
export function calculateInputQuality(text: string, hasImage: boolean): InputQuality {
    const length = text.trim().length;
    
    if (length > 150 || (length > 80 && hasImage)) return "HIGH";
    if (length > 50) return "MEDIUM";
    return "LOW";
}

/**
 * Trust Engine: Combines AI confidence, input quality, and validation status.
 * Returns a weighted score between 0 and 1.
 */
export function calculateTrustScore(
    aiConfidence: number, 
    inputQuality: InputQuality,
    isValidated: boolean
): number {
    let qualityWeight = 0;
    switch (inputQuality) {
        case "HIGH": qualityWeight = 1.0; break;
        case "MEDIUM": qualityWeight = 0.6; break;
        case "LOW": qualityWeight = 0.3; break;
    }

    const validationWeight = isValidated ? 1.0 : 0.0;

    // Weights: AI (50%), Input Quality (30%), Validation (20%)
    const trustScore = (aiConfidence * 0.5) + (qualityWeight * 0.3) + (validationWeight * 0.2);
    
    return Math.min(1, Math.max(0, trustScore));
}
