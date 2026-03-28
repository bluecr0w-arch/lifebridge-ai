/**
 * A simple in-memory session cache for AI results based on input hash.
 */
const cacheStore: Record<string, any> = {};

/**
 * Generates a simple hash string for the input symptom data.
 */
function createHash(text: string, image?: string): string {
    return btoa(unescape(encodeURIComponent(text + (image || "")))).substring(0, 32);
}

export function getFromCache<T>(text: string, image?: string): T | null {
    const hash = createHash(text, image);
    return cacheStore[hash] || null;
}

export function saveToCache(text: string, image: string | undefined, data: any): void {
    const hash = createHash(text, image);
    cacheStore[hash] = data;
}
