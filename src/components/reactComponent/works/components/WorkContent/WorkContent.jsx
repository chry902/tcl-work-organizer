import React from "react";
import styles from "./WorkContent.module.scss";

export default function WorkContent({
  w,
  expanded,
  editingNotesId,
  notesDraft,
  setNotesDraft,
  startEditNotes,
  cancelEditNotes,
  saveNotes,
  busyId,
}) {
  return (
    <div className={styles.textBlock}>
      {/* DESCRIZIONE (sempre visibile) */}
      <div className={styles.textValue}>{w?.description || "-"}</div>

      {/* NOTE (solo quando aperta) */}
      {expanded && (
        <div>
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
            <div className={styles.textValue}>{w?.notes || "-"}</div>
          )}
        </div>
      )}
    </div>
  );
}
