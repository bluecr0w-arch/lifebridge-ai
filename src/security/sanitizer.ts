import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes user-provided text to prevent prompt injection and XSS
 */
export function sanitizeInput(input: string): string {
    // 1. Basic HTML sanitization
    const cleanText = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });

    // 2. Clear known prompt injection keywords if needed (aggressive)
    // Here we just limit the character set and length.
    return cleanText.trim().substring(0, 1000);
}

/**
 * Validates the metadata to ensure inputs aren't potentially malicious.
 */
export function isSafeToProcess(input: string): boolean {
    if (!input || input.length < 3) return false;
    
    const suspiciousPatterns = [/ignore previous instructions/gi, /you are no longer a medical assistant/gi, /system prompt:/gi];
    return !suspiciousPatterns.some(pattern => pattern.test(input));
}
