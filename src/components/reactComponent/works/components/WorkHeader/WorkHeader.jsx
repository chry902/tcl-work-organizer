import React from "react";
import styles from "./WorkHeader.module.scss";

import WorkCodes from "../WorkCodes/WorkCodes";
import WorkMeta from "../WorkMeta/WorkMeta";


export default function WorkHeader({
  w,
  expanded,
  onToggle,
  WorkStatus,
  busyId,
  formatDateIT,
  pillText,
  onDelete,
}) {
  return (
    <div className={styles.cardTop} onClick={onToggle} role="button" tabIndex={0}>
      {!expanded ? (
        // ✅ CHIUSA
        <div className={styles.compactTop}>
          <div className={styles.compactLeft}>
            <span className={styles.compactAvviso}>
              Avv: <strong>{w?.codes?.avviso || "-"}</strong>
            </span>
          </div>

          <div className={styles.compactRight}>
            <div className={styles.dates}>
              <span>
                <span className={styles.dateLabel}>Ini:</span>{" "}
                <strong>{w?.dates?.start ? formatDateIT(w.dates.start) : "-"}</strong>
              </span>
              <span>
                <span className={styles.dateLabel}>Fin:</span>{" "}
                <strong>{w?.dates?.end ? formatDateIT(w.dates.end) : "-"}</strong>
              </span>
            </div>

            <span
              className={`${styles.pill} ${
                w.status === WorkStatus.OPEN
                  ? styles.pillOpen
                  : w.status === WorkStatus.SUSPENDED
                  ? styles.pillSuspended
                  : w.status === WorkStatus.CLOSED
                  ? styles.pillClosed
                  : ""
              }`}
            >
              {pillText(w.status)}
            </span>
          </div>
        </div>
      ) : (
        // ✅ APERTA
        <>
          <div className={styles.topRight}>
            <div className={styles.dates}>
              <span>
                <span className={styles.dateLabel}>Inizio</span>{" "}
                <strong>{w?.dates?.start ? formatDateIT(w.dates.start) : "-"}</strong>
              </span>
              <span>
                <span className={styles.dateLabel}>Fine</span>{" "}
                <strong>{w?.dates?.end ? formatDateIT(w.dates.end) : "-"}</strong>
              </span>
            </div>

            <div className={styles.rightActions}>
              <span
                className={`${styles.pill} ${
                  w.status === WorkStatus.OPEN
                    ? styles.pillOpen
                    : w.status === WorkStatus.SUSPENDED
                    ? styles.pillSuspended
                    : w.status === WorkStatus.CLOSED
                    ? styles.pillClosed
                    : ""
                }`}
              >
                {pillText(w.status)}
              </span>

              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(w.id);
                }}
                disabled={busyId === w.id}
                title="Elimina lavoro"
              >
                {busyId === w.id ? "..." : "Elimina"}
              </button>
            </div>
          </div>

          <div className={styles.topLeft}>
            <WorkCodes codes={w.codes} />
<WorkMeta context={w.context} />

          </div>
        </>
      )}
    </div>
  );
}
