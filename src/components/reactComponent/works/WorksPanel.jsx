import WorkCard from "./components/WorkCard/WorkCard";

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

function pillText(status) {
  if (status === WorkStatus.OPEN) return "APERTO";
  if (status === WorkStatus.SUSPENDED) return "SOSPESO";
  return "EVASO";
}

const STATUS_ORDER = {
  [WorkStatus.OPEN]: 0,
  [WorkStatus.SUSPENDED]: 1,
  [WorkStatus.PROGRAMMED]: 2,
  [WorkStatus.CLOSED]: 3,
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
  const [expandedMap, setExpandedMap] = useState({});
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [works, setWorks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  // Toggle expanded state for a work item
  const toggleExpanded = (id) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Search
  const [query, setQuery] = useState("");
  useEffect(() => {
  if (query.trim().length > 0) {
    setStatusFilter("ALL");
  }
}, [query]);


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
      setIsFormOpen(false);
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

  const hasQuery = query.trim().length > 0;

  // ✅ SE stai cercando → ignora filtro stato
  // ✅ SE NON stai cercando → applica filtro stato

  const finalWorks = hasQuery
    ? filteredWorks
    : statusFilter === "ALL"
      ? filteredWorks
      : filteredWorks.filter((w) => w.status === statusFilter);

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
          Risultati: {finalWorks.length} / {works.length}
        </div>
         {/* ✅ STATUS FILTER BAR (sotto la search) */}
      <div className={styles.statusBar}>
        <button
          type="button"
          className={`${styles.statusTab} ${statusFilter === "ALL" ? styles.statusTabActive : ""
            }`}
          onClick={() => setStatusFilter("ALL")}
          disabled={hasQuery}
        >
          Tutti
        </button>

        <button
          type="button"
          className={`${styles.statusTab} ${statusFilter === WorkStatus.OPEN ? styles.statusTabActive : ""
            }`}
          onClick={() => setStatusFilter(WorkStatus.OPEN)}
          disabled={hasQuery}
        >
          Aperto
        </button>

        <button
          type="button"
          className={`${styles.statusTab} ${statusFilter === WorkStatus.SUSPENDED ? styles.statusTabActive : ""
            }`}
          onClick={() => setStatusFilter(WorkStatus.SUSPENDED)}
          disabled={hasQuery}
        >
          Sospeso
        </button>
 <button
  type="button"
  className={`${styles.statusTab} ${
    statusFilter === WorkStatus.PROGRAMMED ? styles.statusTabActive : ""
  }`}
  onClick={() => setStatusFilter(WorkStatus.PROGRAMMED)}
  disabled={hasQuery}
>
 In Program
</button>

        <button
          type="button"
          className={`${styles.statusTab} ${statusFilter === WorkStatus.CLOSED ? styles.statusTabActive : ""
            }`}
          onClick={() => setStatusFilter(WorkStatus.CLOSED)}
          disabled={hasQuery}
        >
          Evaso
        </button>
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
        ) : finalWorks.length === 0 ? (
          <p>Nessun lavoro trovato.</p>
        ) : (
          <div className={styles.cards}>
            {finalWorks.map((w) => (
              <WorkCard
                key={w.id}
                w={w}
                expanded={!!expandedMap[w.id]}
                onToggle={() => toggleExpanded(w.id)}
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
                cardClassByStatus={(status) => {
                  if (status === WorkStatus.OPEN) return styles.cardOpen;
                  if (status === WorkStatus.SUSPENDED) return styles.cardSuspended;
                  if (status === WorkStatus.CLOSED) return styles.cardClosed;
                  return "";
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
