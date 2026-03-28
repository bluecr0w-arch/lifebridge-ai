"use client";

import React, { useEffect, useState } from "react";
import styles from "./ResultDisplay.module.css";
import { AIResponse } from "@/validators/aiSchema";
import { DecisionState } from "@/core/decisionEngine";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { AlertTriangle, MapPin, Activity, CheckCircle, ShieldAlert, Volume2, Info } from "lucide-react";

interface ResultDisplayProps {
  response: AIResponse;
  decision: DecisionState;
}

export default function ResultDisplay({ response, decision }: ResultDisplayProps) {
  const { speak } = useSpeechSynthesis();
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Auto-speak critical alerts if decision is EMERGENCY
  useEffect(() => {
    if (decision === "EMERGENCY" && ttsEnabled) {
      speak("Medical emergency detected. Please seek immediate medical attention or call emergency services.");
    }
  }, [decision, speak, ttsEnabled]);

  const getRiskClass = (level: string) => {
    if (level === "LOW") return styles.riskLow;
    if (level === "MEDIUM") return styles.riskMedium;
    return styles.riskHigh;
  };

  const mapLink = "https://www.google.com/maps/search/nearest+hospital";

  return (
    <div className={`${styles.container} animate-fade-in`}>
      {decision === "EMERGENCY" && (
        <div className={styles.emergencyBanner}>
          <AlertTriangle size={32} />
          <div>
            <strong>MEDICAL EMERGENCY DETECTED</strong>
            <div style={{ fontSize: "1rem", fontWeight: 400, marginTop: "4px" }}>
              Please seek immediate medical attention or call emergency services.
            </div>
          </div>
        </div>
      )}

      {decision === "UNCERTAIN" && (
          <div className={styles.warningBanner}>
              <Info size={24} />
              <div>
                  <strong>Low Confidence Assessment</strong>
                  <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>
                      The provided information was vague. Please describe your symptoms in more detail for a more accurate assessment.
                  </div>
              </div>
          </div>
      )}

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h2 className={styles.title}>Assessment</h2>
            <button 
                onClick={() => {
                    setTtsEnabled(!ttsEnabled);
                    if (!ttsEnabled) speak(response.possible_condition);
                }}
                className={`${styles.ttsBtn} ${ttsEnabled ? styles.active : ""}`}
                title="Read assessment aloud"
            >
                <Volume2 size={20} />
            </button>
          </div>
          
          <div className={styles.badges}>
            <span className={`${styles.badge} ${getRiskClass(response.risk_level)}`}>
              {response.risk_level === "LOW" && <CheckCircle size={16} />}
              {response.risk_level === "MEDIUM" && <Activity size={16} />}
              {response.risk_level === "HIGH" && <ShieldAlert size={16} />}
              {response.risk_level} RISK
            </span>
            <span className={styles.confidence}>
              Confidence: {Math.round(response.confidence * 100)}%
            </span>
          </div>
        </div>

        <div className={styles.sectionTitle}>Possible Condition</div>
        <div className={styles.conditionText}>{response.possible_condition}</div>

        <div className={styles.sectionTitle}>Reasoning</div>
        <div className={styles.reasoningText}>{response.reasoning}</div>

        <div className={styles.sectionTitle}>Recommended Actions</div>
        <ul className={styles.actionsList}>
          {response.recommended_actions.map((act, idx) => (
            <li key={idx} className={styles.actionItem}>{act}</li>
          ))}
        </ul>

        {response.risk_level === "HIGH" && (
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapLink}
          >
            <MapPin size={24} />
            Find Nearest Hospital
          </a>
        )}
      </div>
    </div>
  );
}
