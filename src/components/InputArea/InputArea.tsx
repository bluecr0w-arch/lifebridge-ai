"use client";

import React, { useState, useRef, useCallback } from "react";
import styles from "./InputArea.module.css";
import { Mic, Image as ImageIcon, StopCircle, Send, X } from "lucide-react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { resizeImage } from "@/utils/imageResize";

interface InputAreaProps {
  onSubmit: (text: string, image?: string) => void;
  isLoading: boolean;
}

export default function InputArea({ onSubmit, isLoading }: InputAreaProps) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Voice Recognition callback
  const onVoiceResult = useCallback((newText: string) => {
    setText((prev) => {
      const spacer = prev.length > 0 && !prev.endsWith(" ") ? " " : "";
      return prev + spacer + newText;
    });
  }, []);

  const { isRecording, toggleRecording } = useVoiceRecognition(onVoiceResult);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        try {
            // Compress image before setting state to save memory and tokens
            const compressed = await resizeImage(rawBase64);
            setImage(compressed);
        } catch (err) {
            console.error("Image processing failed:", err);
            setImage(rawBase64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
      setImage(undefined);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() || image) {
      onSubmit(text, image);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit} aria-label="Symptom Input Form">
      <textarea
        className={styles.textarea}
        placeholder="Describe your symptoms in detail (e.g., 'Sharp pain in lower back after lifting' or 'Severe headache since morning')..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading}
        aria-required="true"
      />
      
      {image && (
          <div className={styles.imagePreviewContainer}>
              <img src={image} alt="Uploaded symptom visual" className={styles.imagePreview} />
              <button 
                  type="button" 
                  onClick={handleClearImage}
                  className={styles.clearImageBtn}
                  aria-label="Remove image"
              >
                <X size={16} />
              </button>
          </div>
      )}

      <div className={styles.controls}>
        <div className={styles.features}>
          <button
            type="button"
            className={`${styles.iconBtn} ${isRecording ? styles.recording : ""}`}
            onClick={toggleRecording}
            title={isRecording ? "Stop voice input" : "Start voice input"}
            aria-pressed={isRecording}
          >
            {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
          </button>
          
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => fileInputRef.current?.click()}
            title="Upload image for visual assessment"
          >
            <ImageIcon size={24} />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            className={styles.uploadInput}
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={isLoading || (!text.trim() && !image)}
        >
          {isLoading ? "Analyzing..." : <><Send size={18} style={{marginRight: 8, verticalAlign: 'middle'}}/> Analyze Symptoms</>}
        </button>
      </div>
    </form>
  );
}
