import DOMPurify from "isomorphic-dompurify";

export type SafetyStatus = "SAFE" | "SUSPICIOUS" | "BLOCKED";

/**
 * Advanced Input Safety Classifer: Detects injection, malicious, and nonsensical input.
 * Also checks for obvious medical relevance to prevent redundant Gemini API usage.
 */
export function classifyInputSafety(input: string): { status: SafetyStatus; reason?: string } {
    if (!input || input.trim().length < 5) {
        return { status: "BLOCKED", reason: "Input is too short to be a valid medical symptom description." };
    }

    const sanitized = input.toLowerCase();

    // 1. Prompt Injection Detection (Extended)
    const injectionPatterns = [
        /ignore previous/gi, 
        /system prompt/gi, 
        /you are now/gi, 
        /as a developer/gi, 
        /bypass safety/gi,
        /<script/gi,
        /javascript:/gi
    ];
    if (injectionPatterns.some(p => p.test(sanitized))) {
        return { status: "BLOCKED", reason: "Potential security threat detected." };
    }

    // 2. Irrelevant / Malicious Keyword detection (SQL / Shell Injection)
    const garbagePatterns = [
        /hack/gi, /password/gi, /admin/gi, /login/gi, /database/gi, /query/gi,
        /drop table/gi, /truncate/gi, /insert into/gi, /select \* from/gi, /exec\(/gi,
        /rm -rf/gi, /sudo /gi, /chmod /gi, /chown /gi
    ];
    if (garbagePatterns.some(p => p.test(sanitized))) {
        return { status: "BLOCKED", reason: "Forbidden or irrelevant keywords detected." };
    }

    // 3. Medical Relevance Logic (Hackathon Standard: Baseline context check)
    // Common medical terms to verify context
    const medicalTerms = [
        "pain", "ache", "sore", "head", "chest", "breath", "dizzy", "fever", "cough", 
        "heart", "leg", "arm", "blood", "stomach", "rash", "hurt", "swelling", "nause"
    ];
    const hasMedicalContext = medicalTerms.some(term => sanitized.includes(term));
    if (!hasMedicalContext) {
        return { status: "SUSPICIOUS", reason: "Input may not be medical in nature. Proceeding with caution." };
    }

    // 4. Blatant Contradiction Detection (e.g. "I am dead yet breathing")
    if (sanitized.includes("not breathing") && sanitized.includes("normal breath")) {
        return { status: "SUSPICIOUS", reason: "Contradictory information detected. Please be clear." };
    }

    return { status: "SAFE" };
}

/**
 * Sanitizes user input for storage or logging.
 */
export function sanitizeInput(input: string): string {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim().substring(0, 1000);
}
