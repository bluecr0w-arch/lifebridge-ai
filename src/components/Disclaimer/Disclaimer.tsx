import React from "react";
import styles from "./Disclaimer.module.css";
import { Info } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className={styles.container}>
      <Info size={16} />
      <div className={styles.text}>
        <strong>Disclaimer:</strong> LifeBridge AI is an experimental assessment tool and does not provide medical diagnoses. Support your assessment with a professional medical consultation. **In case of an emergency, call 911 immediately.**
      </div>
    </div>
  );
}
