import React from "react";
import styles from "./WorkMeta.module.scss";

export default function WorkMeta({ context }) {
  return (
    <div className={styles.chipsRow}>
      <span className={`${styles.chip} ${styles.chipSoft}`}>
        Ditta: <strong>{context?.ditta || "-"}</strong>
      </span>
      <span className={`${styles.chip} ${styles.chipSoft}`}>
        Area: <strong>{context?.area || "-"}</strong>
      </span>
      <span className={`${styles.chip} ${styles.chipSoft}`}>
        Impianto: <strong>{context?.impianto || "-"}</strong>
      </span>
      <span className={`${styles.chip} ${styles.chipSoft}`}>
        Item: <strong>{context?.item || "-"}</strong>
      </span>
    </div>
  );
}
