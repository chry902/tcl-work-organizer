import React, { useEffect, useMemo, useState } from "react";
import styles from "./WorkSearchBox.module.scss";

/**
 * WorkSearchBox
 * - Controlled: il valore "search" vive nel parent, qui lo aggiorniamo tramite onChange
 * - Debounce interno (per non filtrare ad ogni singolo keypress)
 *
 * Props:
 * - value: string
 * - onChange: (nextValue: string) => void
 * - placeholder?: string
 * - delay?: number (ms)
 * - className?: string
 */
export default function WorkSearchBox({
  value,
  onChange,
  placeholder = "Cerca per avviso, ODA, ODC, PDL, ditta, referente, contesto…",
  delay = 250,
  className = "",
}) {
  const [localValue, setLocalValue] = useState(value ?? "");

  // Se il parent cambia value (es. reset), aggiorniamo l'input
  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  // Debounce: aggiorna il parent dopo "delay" ms dall'ultima digitazione
  useEffect(() => {
    const t = setTimeout(() => {
      onChange?.(localValue);
    }, delay);

    return () => clearTimeout(t);
  }, [localValue, delay, onChange]);

  const isDirty = useMemo(() => (localValue ?? "").trim().length > 0, [localValue]);

  function handleClear() {
    setLocalValue("");
    onChange?.("");
  }

  return (
    <div className={`${styles.searchSection} ${className}`}>
      <div className={styles.inputWrap}>
       

        <input
         id="work-search-input"
         name="work-search-input"
          className={styles.input}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Cerca lavori"
          autoComplete="off"
        />

        {isDirty && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            aria-label="Pulisci ricerca"
            title="Pulisci"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
