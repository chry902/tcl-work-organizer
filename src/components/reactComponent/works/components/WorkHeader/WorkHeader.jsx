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
  const PILL_CLASS = {
    [WorkStatus.OPEN]: styles.pillOpen,
    [WorkStatus.SUSPENDED]: styles.pillSuspended,
    [WorkStatus.PROGRAMMED]: styles.pillProgrammed,
    [WorkStatus.CLOSED]: styles.pillClosed,
  };

  return (
    <div className={styles.cardTop} onClick={onToggle} role="button" tabIndex={0}>
      {!expanded ? (
        // ✅ CHIUSA
        <div className={styles.compactTop}>
          <div className={styles.compactLeft}>
            <span className={styles.compactAvviso}>
              Avv: <strong>{w?.codes?.avviso || "-"}</strong>
            </span>
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
          </div>

          <div className={styles.compactRight}>
            <span className={`${styles.pill} ${PILL_CLASS[w.status] || ""}`}>
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
              <span className={`${styles.pill} ${PILL_CLASS[w.status] || ""}`}>
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
