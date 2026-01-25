import React from "react";
import styles from "./WorkCard.module.scss";

export default function WorkCard({
  w,
  expanded,
  onToggle,

  WorkStatus,
  busyId,

  // helpers
  cardClassByStatus,
  formatDateIT,
  pillText,

  // actions
  onDelete,
  changeStatus,

  // notes edit
  editingNotesId,
  notesDraft,
  setNotesDraft,
  startEditNotes,
  cancelEditNotes,
  saveNotes,
}) {
  if (!w) return null;

  return (
    <div className={`${styles.card} ${cardClassByStatus(w.status)}`}>
      {/* TOP (cliccabile per toggle) */}
      <div
        className={styles.cardTop}
        onClick={onToggle}
        style={{ cursor: "pointer" }}
      >
        {!expanded ? (
          // ✅ CHIUSA: SOLO Avviso + Date + Stato
          <div className={styles.compactTop}>
            <div className={styles.compactLeft}>
              <span className={styles.compactAvviso}>
                Avv: <strong>{w.codes?.avviso || "-"}</strong>
              </span>
            </div>

            <div className={styles.compactRight}>
              <div className={styles.dates}>
                <span className={styles.dateItem}>
                  <span className={styles.dateLabel}>Ini:</span>{" "}
                  <strong>
                    {w?.dates?.start ? formatDateIT(w.dates.start) : "-"}
                  </strong>
                </span>
                <span className={styles.dateItem}>
                  <span className={styles.dateLabel}>Fin:</span>{" "}
                  <strong>
                    {w?.dates?.end ? formatDateIT(w.dates.end) : "-"}
                  </strong>
                </span>
              </div>

              <span className={styles.pill}>{pillText(w.status)}</span>
            </div>
          </div>
        ) : (
          // ✅ APERTA: layout completo + Elimina in alto a destra
          <>
            <div className={styles.topRight}>
              <div className={styles.dates}>
                <span className={styles.dateItem}>
                  <span className={styles.dateLabel}>Inizio</span>{" "}
                  <strong>
                    {w?.dates?.start ? formatDateIT(w.dates.start) : "-"}
                  </strong>
                </span>
                <span className={styles.dateItem}>
                  <span className={styles.dateLabel}>Fine</span>{" "}
                  <strong>
                    {w?.dates?.end ? formatDateIT(w.dates.end) : "-"}
                  </strong>
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className={styles.pill}>{pillText(w.status)}</span>

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
              <div className={styles.chipsRow}>
                <span className={styles.chip}>
                  Avviso: <strong>{w.codes?.avviso || "-"}</strong>
                </span>
                <span className={styles.chip}>
                  ODA: <strong>{w.codes?.oda || "-"}</strong>
                </span>
                <span className={styles.chip}>
                  ODC: <strong>{w.codes?.odc || "-"}</strong>
                </span>
                <span className={styles.chip}>
                  PDL: <strong>{w.codes?.pdl || "-"}</strong>
                </span>
              </div>

              <div className={styles.chipsRow}>
                <span className={`${styles.chip} ${styles.chipSoft}`}>
                  Ditta: <strong>{w.context?.ditta || "-"}</strong>
                </span>
                <span className={`${styles.chip} ${styles.chipSoft}`}>
                  Area: <strong>{w.context?.area || "-"}</strong>
                </span>
                <span className={`${styles.chip} ${styles.chipSoft}`}>
                  Impianto: <strong>{w.context?.impianto || "-"}</strong>
                </span>
                <span className={`${styles.chip} ${styles.chipSoft}`}>
                  Item: <strong>{w.context?.item || "-"}</strong>
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DESCRIZIONE (sempre visibile) */}
      <div className={styles.textBlock}>
        <div className={styles.textSection}>
          <div className={styles.textLabel}>Descr:</div>
          <div className={styles.textValue}>{w.description || "-"}</div>
        </div>

        {/* NOTE (solo quando aperta) */}
        {expanded && (
          <div className={styles.textSection}>
            <div className={styles.textLabelRow}>
              <div className={styles.textLabel}>Note:</div>

              {editingNotesId === w.id ? (
                <div className={styles.noteActions}>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnGhost}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      saveNotes(w);
                    }}
                    disabled={busyId === w.id}
                  >
                    Salva
                  </button>

                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnGhost}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelEditNotes();
                    }}
                    disabled={busyId === w.id}
                  >
                    Annulla
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditNotes(w);
                  }}
                >
                  Modifica
                </button>
              )}
            </div>

            {editingNotesId === w.id ? (
              <textarea
                className={styles.textarea}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={3}
                placeholder="Scrivi note..."
                disabled={busyId === w.id}
              />
            ) : (
              <div className={styles.textValue}>{w.notes || "-"}</div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM (solo quando aperta) */}
      {expanded && (
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
      )}
    </div>
  );
}
