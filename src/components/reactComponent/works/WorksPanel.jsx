import React, { useEffect, useMemo, useState } from "react";
import { patchWorkNotes } from "@/services/works.services.js";
import { WorkStatus } from "@/models/work.model.js";
import {
  getWorks,
  createWork,
  patchWorkStatus,
  deleteWork,
} from "@/services/works.services.js";

import styles from "./WorksPanel.module.scss";

const emptyForm = {
  codes: { avviso: "", oda: "", odc: "", pdl: "" },
  context: { ditta: "", area: "", impianto: "", item: "" },
  description: "",
  notes: "",
  dates: { start: "", end: "" },
};

function cardClassByStatus(status) {
  if (status === WorkStatus.OPEN) return styles.cardOpen;
  if (status === WorkStatus.SUSPENDED) return styles.cardSuspended;
  return styles.cardClosed; // evaso
}

function pillText(status) {
  if (status === WorkStatus.OPEN) return "APERTO";
  if (status === WorkStatus.SUSPENDED) return "SOSPESO";
  return "EVASO";
}

const STATUS_ORDER = {
  [WorkStatus.OPEN]: 0,
  [WorkStatus.SUSPENDED]: 1,
  [WorkStatus.CLOSED]: 2, // EVASO
};

function statusRank(status) {
  return STATUS_ORDER[status] ?? 99;
}

function normalize(str) {
  return String(str || "").trim().toLowerCase();
}

function workMatchesQuery(work, q) {
  const query = normalize(q);
  if (!query) return true;

  const haystack = [
    work?.codes?.avviso,
    work?.codes?.oda,
    work?.codes?.odc,
    work?.codes?.pdl,
    work?.context?.ditta,
    work?.context?.area,
    work?.context?.impianto,
    work?.context?.item,
  ]
    .map(normalize)
    .join(" ");

  return haystack.includes(query);
}

function formatDateIT(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}


export default function WorksPanel() {
  const [works, setWorks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  // Search
  const [query, setQuery] = useState("");

  // Form collapsible
  const [isFormOpen, setIsFormOpen] = useState(false); // di default CHIUSO


  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesDraft, setNotesDraft] = useState("");


  async function refresh() {
    setLoading(true);
    try {
      const data = await getWorks();
      setWorks(data);
    } catch (e) {
      setMsg(e?.message || "Errore caricamento lavori");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function setNested(path, value) {
    const [a, b] = path.split(".");
    setForm((prev) => ({
      ...prev,
      [a]: { ...prev[a], [b]: value },
    }));
  }

  async function onCreate(e) {
    e.preventDefault();
    setMsg("");

    const payload = {
      ...form,
      dates: {
        start: form.dates.start || null,
        end: form.dates.end || null,
      },
    };

    try {
      const created = await createWork(payload);
      setWorks((prev) => [created, ...prev]);
      setForm(emptyForm);
      setMsg("✅ Lavoro creato");
      setIsFormOpen(false); // richiudiamo per lasciarti spazio
    } catch (e) {
      setMsg(e?.message || "Errore creazione lavoro");
    }
  }

  async function changeStatus(id, status) {
    setMsg("");
    setBusyId(id);

    try {
      const updated = await patchWorkStatus(id, status);
      setWorks((prev) => prev.map((w) => (w.id === id ? updated : w)));
      setMsg(`✅ Stato aggiornato: ${status}`);
    } catch (e) {
      setMsg(e?.message || "Errore cambio stato");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id) {
    setMsg("");
    setBusyId(id);

    try {
      await deleteWork(id);
      setWorks((prev) => prev.filter((w) => w.id !== id));
      setMsg("🗑️ Lavoro eliminato");
    } catch (e) {
      setMsg(e?.message || "Errore eliminazione");
    } finally {
      setBusyId(null);
    }
  }

  function startEditNotes(work) {
    setEditingNotesId(work.id);
    setNotesDraft(work.notes || "");
  }

  function cancelEditNotes() {
    setEditingNotesId(null);
    setNotesDraft("");
  }

  async function saveNotes(work) {
    setMsg("");
    setBusyId(work.id);

    try {
      const updated = await patchWorkNotes(work.id, notesDraft);
      setWorks((prev) => prev.map((w) => (w.id === work.id ? updated : w)));

      setMsg("✅ Note aggiornate");
      setEditingNotesId(null);
      setNotesDraft("");
    } catch (e) {
      setMsg(e?.message || "Errore aggiornamento note");
    } finally {
      setBusyId(null);
    }
  }


  const filteredWorks = useMemo(() => {
    return works
      .filter((w) => workMatchesQuery(w, query))
      .sort((a, b) => {
        // 1) stato: aperto -> sospeso -> evaso
        const s = statusRank(a.status) - statusRank(b.status);
        if (s !== 0) return s;

        // 2) a parità di stato: più recenti sopra (updatedAt)
        const ta = a?.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const tb = b?.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return tb - ta;
      });
  }, [works, query]);


  return (
    <div className={styles.panel}>
      {/* HEADER */}
      <div style={{ display: "grid", gap: 8 }}>
        <h2 style={{ margin: 0 }}>Works</h2>
        {msg ? <p style={{ margin: 0 }}>{msg}</p> : null}
      </div>

      {/* FORM COLLASSABILE */}
      <div className={styles.accordion}>
        <div className={styles.accordionHeader}>
          <div className={styles.accordionTitle}>
            <strong>Crea nuovo lavoro</strong>
            <span>Compila solo ciò che serve (campi facoltativi)</span>
          </div>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={() => setIsFormOpen((v) => !v)}
          >
            {isFormOpen ? "Chiudi" : "Apri"}
          </button>
        </div>

        {isFormOpen ? (
          <>
            <div className={styles.divider} />

            <form onSubmit={onCreate} className={styles.row}>
              <div className={styles.row}>
                <strong>Codici</strong>
                <div className={styles.grid4}>
                  <input
                  name="avviso"
                    id="avviso"
                    className={styles.input}
                    placeholder="Avviso"
                    value={form.codes.avviso}
                    onChange={(e) => setNested("codes.avviso", e.target.value)}
                  />
                  <input
                    name="oda"
                    id="oda"
                    className={styles.input}
                    placeholder="ODA"
                    value={form.codes.oda}
                    onChange={(e) => setNested("codes.oda", e.target.value)}
                  />
                  <input
                    name="odc"
                    id="odc"
                    className={styles.input}
                    placeholder="ODC"
                    value={form.codes.odc}
                    onChange={(e) => setNested("codes.odc", e.target.value)}
                  />
                  <input
                    name="pdl"
                    id="pdl"
                    className={styles.input}
                    placeholder="PDL"
                    value={form.codes.pdl}
                    onChange={(e) => setNested("codes.pdl", e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <strong>Contesto</strong>
                <div className={styles.grid4}>
                  <input
                    name="ditta"
                    id="ditta"
                    className={styles.input}
                    placeholder="Ditta"
                    value={form.context.ditta}
                    onChange={(e) => setNested("context.ditta", e.target.value)}
                  />
                  <input
                    name="area"
                    id="area"
                    className={styles.input}
                    placeholder="Area"
                    value={form.context.area}
                    onChange={(e) => setNested("context.area", e.target.value)}
                  />
                  <input
                    name="impianto"
                    id="impianto"
                    className={styles.input}
                    placeholder="Impianto"
                    value={form.context.impianto}
                    onChange={(e) =>
                      setNested("context.impianto", e.target.value)
                    }
                  />
                  <input
                    name="item"
                    id="item"
                    className={styles.input}
                    placeholder="Item"
                    value={form.context.item}
                    onChange={(e) => setNested("context.item", e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <strong>Descrizione</strong>
                <textarea
                  className={styles.textarea}
                  placeholder="Descrizione lavoro"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className={styles.row}>
                <strong>Note</strong>
                <textarea
                  className={styles.textarea}
                  placeholder="Note"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={2}
                />
              </div>

              <div className={styles.row}>
                <strong>Date (facoltative)</strong>
                <div className={styles.grid2}>
                  <label className={styles.row}>
                    <span style={{ fontSize: 12, opacity: 0.75 }}>Inizio</span>
                    <input
                      name="date-start"
                      id="date-start"
                      className={styles.input}
                      type="date"
                      value={form.dates.start}
                      onChange={(e) => setNested("dates.start", e.target.value)}
                    />
                  </label>

                  <label className={styles.row}>
                    <span style={{ fontSize: 12, opacity: 0.75 }}>Fine</span>
                    <input
                      name="date-end"
                      id="date-end"
                      className={styles.input}
                      type="date"
                      value={form.dates.end}
                      onChange={(e) => setNested("dates.end", e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Crea lavoro
                </button>

                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost}`}
                  onClick={() => setForm(emptyForm)}
                >
                  Reset
                </button>
              </div>
            </form>
          </>
        ) : null}
      </div>

      {/* SEARCH */}
      <div className={styles.searchBox}>
        <strong>Ricerca</strong>

        <div className={styles.searchRow}>
          <input
            className={styles.input}
            placeholder="Cerca per avviso, ODA, ODC, PDL, ditta, area, impianto, item…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={() => setQuery("")}
            disabled={!query}
          >
            Pulisci
          </button>
        </div>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Risultati: {filteredWorks.length} / {works.length}
        </div>
      </div>

      {/* LISTA */}
      <div style={{ display: "grid", gap: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <strong>Lista lavori</strong>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={refresh}
            disabled={loading}
          >
            {loading ? "Carico..." : "Ricarica"}
          </button>
        </div>

        {loading ? (
          <p>Caricamento...</p>
        ) : filteredWorks.length === 0 ? (
          <p>Nessun lavoro trovato.</p>
        ) : (
          <div className={styles.cards}>
            {filteredWorks.map((w) => (
              <div
                key={w.id}
                className={`${styles.card} ${cardClassByStatus(w.status)}`}
              >
                {/* TOP */}
                <div className={styles.cardTop}>
                  <div className={styles.topRight}>
                    <div className={styles.dates}>
                      <span className={styles.dateItem}>
                        <span className={styles.dateLabel}>Inizio</span>{" "}
                        <strong>{w?.dates?.start ? formatDateIT(w.dates.start) : "-"}</strong>
                      </span>
                      <span className={styles.dateItem}>
                        <span className={styles.dateLabel}>Fine</span>{" "}
                        <strong>{w?.dates?.end ? formatDateIT(w.dates.end) : "-"}</strong>
                      </span>
                    </div>

                    <span className={styles.pill}>{pillText(w.status)}</span>
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

                </div>

                {/* TEXT */}
                <div className={styles.textBlock}>
                  <div className={styles.textSection}>
                    <div className={styles.textLabel}>Descrizione</div>
                    <div className={styles.textValue}>{w.description || "-"}</div>
                  </div>

                  <div className={styles.textSection}>

                    <div className={styles.textLabelRow}>
                    <div className={styles.textLabel}>Note</div>
                      {/* -------------- */}
                      {editingNotesId === w.id ? (
                        <div className={styles.noteActions}>
                          <button
                            type="button"
                            className={`${styles.btn} ${styles.btnGhost}`}
                            onClick={() => saveNotes(w)}
                            disabled={busyId === w.id}
                          >
                            Salva
                          </button>

                          <button
                            type="button"
                            className={`${styles.btn} ${styles.btnGhost}`}
                            onClick={cancelEditNotes}
                            disabled={busyId === w.id}
                          >
                            Annulla
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnGhost}`}
                          onClick={() => startEditNotes(w)}
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

                </div>

                {/* BOTTOM */}
                <div className={styles.cardBottom}>
                  
                    {/* <div className={styles.statusTitle}>Stato</div> */}

                    <div className={styles.checks}>
                      {Object.values(WorkStatus).map((s) => (
                        <label key={s} className={styles.check}>
                          <input
                            type="checkbox"
                            checked={w.status === s}
                            onChange={() => changeStatus(w.id, s)}
                            disabled={busyId === w.id}
                          />
                          <span>{s}</span>
                        </label>
                      ))}


                    
                  </div>
                      <button
                      type="button"
                      className={`${styles.btn} ${styles.btnDanger}`}
                      onClick={() => onDelete(w.id)}
                      disabled={busyId === w.id}
                    >
                      {busyId === w.id ? "..." : "Elimina"}
                    </button>

                  {/* <div className={styles.bottomRight}>
                   

                    
                     
                  </div> */}
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}
