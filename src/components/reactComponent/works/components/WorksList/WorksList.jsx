import React from "react";
import WorkCard from "../WorkCard/WorkCard";
import styles from "./WorksList.module.scss";

/**
 * WorksList
 * Renderizza solo la lista (loading / empty / cards)
 *
 * Props:
 * - loading: boolean
 * - works: array
 * - expandedMap: { [id]: boolean }
 * - onToggle: (id) => void
 * - WorkStatus, busyId, formatDateIT, pillText
 * - onDelete, changeStatus
 * - editingNotesId, notesDraft, setNotesDraft
 * - startEditNotes, cancelEditNotes, saveNotes
 * - cardClassByStatus: (status) => string
 */
export default function WorksList({
  loading,
  works,
  expandedMap,
  onToggle,

  WorkStatus,
  busyId,
  formatDateIT,
  pillText,

  onDelete,
  changeStatus,

  editingNotesId,
  notesDraft,
  setNotesDraft,
  startEditNotes,
  cancelEditNotes,
  saveNotes,

  cardClassByStatus,
}) {
  if (loading) return <p>Caricamento...</p>;
  if (!works || works.length === 0) return <p>Nessun lavoro trovato.</p>;

  return (
    <div className={styles.cards}>
      {works.map((w) => (
        <WorkCard
          key={w.id}
          w={w}
          expanded={!!expandedMap?.[w.id]}
          onToggle={() => onToggle?.(w.id)}
          WorkStatus={WorkStatus}
          busyId={busyId}
          formatDateIT={formatDateIT}
          pillText={pillText}
          onDelete={onDelete}
          changeStatus={changeStatus}
          editingNotesId={editingNotesId}
          notesDraft={notesDraft}
          setNotesDraft={setNotesDraft}
          startEditNotes={startEditNotes}
          cancelEditNotes={cancelEditNotes}
          saveNotes={saveNotes}
          cardClassByStatus={cardClassByStatus}
        />
      ))}
    </div>
  );
}
