"use client";

import { useState } from "react";
import styles from "./page.module.css";
import InputArea from "@/components/InputArea/InputArea";
import ResultDisplay from "@/components/ResultDisplay/ResultDisplay";
import { AIResponse } from "@/lib/schema";
import { DecisionState, evaluateDecision } from "@/lib/decisionEngine";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [decision, setDecision] = useState<DecisionState | null>(null);

  const handleSubmit = async (text: string, image?: string) => {
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
      setResult(aiResponse);
      setDecision(evaluateDecision(aiResponse));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again or seek emergency care if immediate help is needed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.brand}>
        <h1 className={styles.brandTitle}>LifeBridge AI</h1>
        <p className={styles.brandSubtitle}>
          Convert real-world symptoms into structured, life-saving medical guidance. 
          Use text, voice, or image to get an assessment.
        </p>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.glassPanel}>
          <InputArea onSubmit={handleSubmit} isLoading={loading} />
        </div>

        {error && (
          <div className={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
          </div>
        )}

        {!loading && result && decision && (
          <ResultDisplay response={result} decision={decision} />
        )}
      </div>
    </main>
  );
}
