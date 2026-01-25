import React from "react";
import styles from "./WorksListHeader.module.scss";

export default function WorksListHeader({ loading, onRefresh }) {
  return (
    <div className={styles.header}>
      <strong>Lista lavori</strong>

      <button
        type="button"
        className={`${styles.btn} ${styles.btnGhost}`}
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? "Carico..." : "Ricarica"}
      </button>
    </div>
  );
}
