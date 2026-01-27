import React from "react";
import styles from "./WorkFooter.module.scss";

export default function WorkFooter({
  w,
  expanded,
  WorkStatus,
  busyId,
  changeStatus,
}) {
  if (!expanded) return null;

  const statusLabel = (status) => {
    if (status === WorkStatus.OPEN) return "APERTO";
    if (status === WorkStatus.SUSPENDED) return "SOSPESO";
    if (status === WorkStatus.PROGRAMMED) return "PROGRAM.";
    if (status === WorkStatus.CLOSED) return "EVASO";
    return status;
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div
      className={styles.cardBottom}
      onMouseDown={stop}
      onClick={stop}
    >
      <div className={styles.checks} onMouseDown={stop} onClick={stop}>
        {Object.values(WorkStatus).map((s) => (
          <label
            key={s}
            className={styles.check}
            onMouseDown={stop}
            onClick={stop}
          >
            <input
              type="checkbox"
              checked={w.status === s}
              onMouseDown={stop}
              onClick={stop}
              onChange={() => changeStatus(w.id, s)}
              disabled={busyId === w.id}
            />
            <span>{statusLabel(s)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
