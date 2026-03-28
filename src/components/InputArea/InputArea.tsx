"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./InputArea.module.css";
import { Mic, Image as ImageIcon, StopCircle, Send } from "lucide-react";

interface InputAreaProps {
  onSubmit: (text: string, image?: string) => void;
  isLoading: boolean;
}

export default function InputArea({ onSubmit, isLoading }: InputAreaProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [image, setImage] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize SpeechRecognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setText((prev) => {
           // Provide a space if needed
           const spacer = prev.length > 0 && !prev.endsWith(" ") ? " " : "";
           return prev + spacer + currentTranscript;
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
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
    <form className={styles.container} onSubmit={handleSubmit}>
      <textarea
        className={styles.textarea}
        placeholder="Describe your symptoms in detail..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading}
      />
      
      {image && (
          <div style={{ position: "relative", width: "fit-content" }}>
              <img src={image} alt="Uploaded symptom" style={{ maxWidth: "200px", borderRadius: "12px", border: "1px solid var(--glass-border)" }} />
              <button 
                  type="button" 
                  onClick={handleClearImage}
                  style={{ position: "absolute", top: -10, right: -10, background: "var(--danger)", color: "white", borderRadius: "50%", width: 24, height: 24, padding: 0, border: "none", cursor: "pointer" }}
              >✕</button>
          </div>
      )}

      <div className={styles.controls}>
        <div className={styles.features}>
          <button
            type="button"
            className={`${styles.iconBtn} ${isRecording ? styles.recording : ""}`}
            onClick={toggleRecording}
            title={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
          </button>
          
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => fileInputRef.current?.click()}
            title="Upload image"
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
          {isLoading ? "Processing..." : <><Send size={18} style={{marginRight: 8, verticalAlign: 'middle'}}/> Analyze</>}
        </button>
      </div>
    </form>
  );
}
