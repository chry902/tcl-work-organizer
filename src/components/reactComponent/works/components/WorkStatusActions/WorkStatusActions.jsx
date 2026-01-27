import React from "react";
import styles from "./WorkCodes.module.scss";

export default function WorkCodes({ codes }) {
  return (
    <div className={styles.chipsRow}>
      <span className={styles.chip}>
        Avviso: <strong>{codes?.avviso || "-"}</strong>
      </span>
      <span className={styles.chip}>
        ODA: <strong>{codes?.oda || "-"}</strong>
      </span>
      <span className={styles.chip}>
        ODC: <strong>{codes?.odc || "-"}</strong>
      </span>
      <span className={styles.chip}>
        PDL: <strong>{codes?.pdl || "-"}</strong>
      </span>
    </div>
  );
}
