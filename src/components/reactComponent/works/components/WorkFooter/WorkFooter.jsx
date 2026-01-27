import React from "react";
import styles from "./WorkFooter.module.scss";

export default function WorkFooter({ w, expanded, WorkStatus, busyId, changeStatus }) {
  if (!expanded) return null;

  return (
    <div className={styles.cardBottom}>
      <div className={styles.checks}>
        {Object.values(WorkStatus).map((s) => (
          <label key={s} className={styles.check}>
            <input
              type="checkbox"
              checked={w.status === s}
              onClick={(e) => e.stopPropagation()}
              onChange={() => changeStatus(w.id, s)}
              disabled={busyId === w.id}
            />
            <span>{s}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
