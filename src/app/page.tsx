"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import Disclaimer from "@/components/Disclaimer/Disclaimer";
import InputArea from "@/components/InputArea/InputArea";
import ResultDisplay from "@/components/ResultDisplay/ResultDisplay";
import { AIResponse } from "@/validators/aiSchema";
import { DecisionState, evaluateDecision } from "@/core/decisionEngine";
import { calculateInputQuality, calculateTrustScore } from "@/core/trustEngine";
import { getFromCache, saveToCache } from "@/utils/cache";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [decision, setDecision] = useState<DecisionState | null>(null);
  const [trustScore, setTrustScore] = useState<number>(0);

  const handleSubmit = async (text: string, image?: string) => {
    // 1. Calculate Input Quality Immediately
    const quality = calculateInputQuality(text, !!image);
    
    // 2. Check Cache
    const cached = getFromCache<AIResponse>(text, image);
    if (cached) {
        const score = calculateTrustScore(cached.confidence, quality, true);
        setTrustScore(score);
        setResult(cached);
        setDecision(evaluateDecision(cached, score));
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setDecision(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, image }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze symptoms");
      }

      const aiResponse = data.result as AIResponse;
      
      // 3. Calculate Final Trust Score
      const finalScore = calculateTrustScore(aiResponse.confidence, quality, true);
      
      // 4. Save to Cache
      saveToCache(text, image, aiResponse);
      
      setTrustScore(finalScore);
      setResult(aiResponse);
      setDecision(evaluateDecision(aiResponse, finalScore));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again or seek emergency care if immediate help is needed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.brand}>
          <h1 className={styles.brandTitle}>Triage Assistant</h1>
          <p className={styles.brandSubtitle}>
            Translate physical distress into structured medical insights. 
            Analyze symptoms via voice, text, or visual upload.
          </p>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.glassPanel}>
            <InputArea onSubmit={handleSubmit} isLoading={loading} />
          </div>

          {error && (
            <div className={styles.error} role="alert">
              <strong>Analysis Error:</strong> {error}
            </div>
          )}

          {loading && (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <p>Analyzing symptoms with Gemini AI...</p>
            </div>
          )}

          {!loading && result && decision && (
            <ResultDisplay response={result} decision={decision} trustScore={trustScore} />
          )}

          <div style={{ marginTop: "40px" }}>
            <Disclaimer />
          </div>
        </div>
      </main>

      <footer className={styles.pageFooter}>
        © 2026 LifeBridge AI • Hackathon Edition • Developed for Health & Safety
      </footer>
    </div>
  );
}
