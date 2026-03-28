"use client";

import React from "react";
import styles from "./ResultDisplay.module.css";
import { AIResponse } from "@/lib/schema";
import { DecisionState } from "@/lib/decisionEngine";
import { AlertTriangle, MapPin, Activity, CheckCircle, ShieldAlert } from "lucide-react";

interface ResultDisplayProps {
  response: AIResponse;
  decision: DecisionState;
}

export default function ResultDisplay({ response, decision }: ResultDisplayProps) {
  const getRiskClass = (level: string) => {
    if (level === "LOW") return styles.riskLow;
    if (level === "MEDIUM") return styles.riskMedium;
    return styles.riskHigh;
  };

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

      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Assessment</h2>
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

        <div className={styles.sectionTitle}>Recommended Actions</div>
        <ul className={styles.actionsList}>
          {response.recommended_actions.map((act, idx) => (
            <li key={idx} className={styles.actionItem}>{act}</li>
          ))}
        </ul>

        {response.risk_level === "HIGH" && (
          <a
            href="https://www.google.com/maps/search/nearest+hospital"
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
