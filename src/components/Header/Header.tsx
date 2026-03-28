import React from "react";
import styles from "./Header.module.css";
import { Activity } from "lucide-react";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Activity className={styles.logo} size={32} />
        <span className={styles.title}>LifeBridge AI</span>
      </div>
      <nav className={styles.nav}>
        <a href="/" className={styles.link}>Assessment</a>
        <a href="#about" className={styles.link}>About</a>
      </nav>
    </header>
  );
}
