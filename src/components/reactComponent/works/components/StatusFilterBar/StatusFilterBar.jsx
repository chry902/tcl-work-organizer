import React from "react";
import styles from "./StatusFilterBar.module.scss";

/**
 * StatusFilterBar
 *
 * Props:
 * - value: string ("ALL" | WorkStatus.OPEN | ...)
 * - onChange: (nextValue: string) => void
 * - disabled?: boolean
 * - WorkStatus: enum
 */
export default function StatusFilterBar({
  value,
  onChange,
  disabled = false,
  WorkStatus,
}) {
  return (
    <div className={styles.statusBar}>
      <button
        type="button"
        className={`${styles.tab} ${value === "ALL" ? styles.active : ""}`}
        onClick={() => onChange("ALL")}
        disabled={disabled}
      >
        Tutti
      </button>

      <button
        type="button"
        className={`${styles.tab} ${value === WorkStatus.OPEN ? styles.active : ""}`}
        onClick={() => onChange(WorkStatus.OPEN)}
        disabled={disabled}
      >
        Aperto
      </button>

      <button
        type="button"
        className={`${styles.tab} ${value === WorkStatus.SUSPENDED ? styles.active : ""}`}
        onClick={() => onChange(WorkStatus.SUSPENDED)}
        disabled={disabled}
      >
        Sospeso
      </button>

      <button
        type="button"
        className={`${styles.tab} ${value === WorkStatus.PROGRAMMED ? styles.active : ""}`}
        onClick={() => onChange(WorkStatus.PROGRAMMED)}
        disabled={disabled}
      >
        In Program
      </button>

      <button
        type="button"
        className={`${styles.tab} ${value === WorkStatus.CLOSED ? styles.active : ""}`}
        onClick={() => onChange(WorkStatus.CLOSED)}
        disabled={disabled}
      >
        Evaso
      </button>
    </div>
  );
}
