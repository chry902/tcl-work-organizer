import React from "react";
import styles from "./WorkCard.module.scss";

import WorkHeader from "../WorkHeader/WorkHeader";
import WorkContent from "../WorkContent/WorkContent";
import WorkFooter from "../WorkFooter/WorkFooter";

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
    <div className={`${styles.card} ${cardClassByStatus(w.status, styles)}`}>
      {/* HEADER */}
      <WorkHeader
        w={w}
        expanded={expanded}
        onToggle={onToggle}
        WorkStatus={WorkStatus}
        busyId={busyId}
        formatDateIT={formatDateIT}
        pillText={pillText}
        onDelete={onDelete}
      />

      {/* CONTENT */}
      <WorkContent
        w={w}
        expanded={expanded}
        editingNotesId={editingNotesId}
        notesDraft={notesDraft}
        setNotesDraft={setNotesDraft}
        startEditNotes={startEditNotes}
        cancelEditNotes={cancelEditNotes}
        saveNotes={saveNotes}
        busyId={busyId}
      />

      {/* FOOTER */}
      <WorkFooter
        w={w}
        expanded={expanded}
        WorkStatus={WorkStatus}
        busyId={busyId}
        changeStatus={changeStatus}
      />
    </div>
  );
}
