import React, { useEffect, useMemo, useState } from "react";
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

  const filteredWorks = useMemo(() => {
    return works.filter((w) => workMatchesQuery(w, query));
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
                    className={styles.input}
                    placeholder="Avviso"
                    value={form.codes.avviso}
                    onChange={(e) => setNested("codes.avviso", e.target.value)}
                  />
                  <input
                    className={styles.input}
                    placeholder="ODA"
                    value={form.codes.oda}
                    onChange={(e) => setNested("codes.oda", e.target.value)}
                  />
                  <input
                    className={styles.input}
                    placeholder="ODC"
                    value={form.codes.odc}
                    onChange={(e) => setNested("codes.odc", e.target.value)}
                  />
                  <input
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
                    className={styles.input}
                    placeholder="Ditta"
                    value={form.context.ditta}
                    onChange={(e) => setNested("context.ditta", e.target.value)}
                  />
                  <input
                    className={styles.input}
                    placeholder="Area"
                    value={form.context.area}
                    onChange={(e) => setNested("context.area", e.target.value)}
                  />
                  <input
                    className={styles.input}
                    placeholder="Impianto"
                    value={form.context.impianto}
                    onChange={(e) =>
                      setNested("context.impianto", e.target.value)
                    }
                  />
                  <input
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
                      className={styles.input}
                      type="date"
                      value={form.dates.start}
                      onChange={(e) => setNested("dates.start", e.target.value)}
                    />
                  </label>

                  <label className={styles.row}>
                    <span style={{ fontSize: 12, opacity: 0.75 }}>Fine</span>
                    <input
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
                <div className={styles.header}>
                  <div className={styles.titleBlock}>
                    <h3 className={styles.title}>
                      {w.codes?.avviso
                        ? `Avviso: ${w.codes.avviso}`
                        : `Work: ${w.id}`}
                    </h3>

                    <p className={styles.meta}>
                      {w.context?.ditta ? `${w.context.ditta}` : ""}
                      {w.context?.area ? ` • ${w.context.area}` : ""}
                      {w.context?.impianto ? ` • ${w.context.impianto}` : ""}
                      {w.context?.item ? ` • ${w.context.item}` : ""}
                    </p>
                  </div>

                  <span className={styles.pill}>{pillText(w.status)}</span>
                </div>

                <div className={styles.body}>
                  {w.description ? (
                    <p className={styles.description}>{w.description}</p>
                  ) : null}

                  {w.notes ? <p className={styles.notes}>{w.notes}</p> : null}
                </div>

                <div className={styles.controls}>
                  <div className={styles.statusRow}>
                    <div className={styles.statusLabel}>Stato</div>

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
                  </div>

                  <div className={styles.footer}>
                    <div className={styles.small}>
                      Aggiornato: {new Date(w.updatedAt).toLocaleString()}
                    </div>

                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnDanger}`}
                      onClick={() => onDelete(w.id)}
                      disabled={busyId === w.id}
                    >
                      {busyId === w.id ? "..." : "Elimina"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
