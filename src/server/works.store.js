// src/server/works.store.js
import { createEmptyWork } from "@/models/work.model.js";

// In-memory store (DEV). In produzione con serverless NON è persistente.
const works = new Map();

/** Genera un id semplice (poi passeremo a UUID o DB id) */
function generateId() {
  return String(Date.now()) + "-" + String(Math.floor(Math.random() * 10000));
}

/** Ritorna tutti i lavori come array */
export function listWorks() {
  return Array.from(works.values());
}

/** Ritorna un lavoro per id */
export function getWorkById(id) {
  return works.get(String(id)) || null;
}

/** Crea un lavoro nuovo (mergiando eventuali campi passati) */
export function createWork(payload = {}) {
  const work = createEmptyWork();

  const id = generateId();
  work.id = id;

  // merge superficiale + merge nested per codes/context/dates
  work.status = payload.status ?? work.status;

  work.codes = { ...work.codes, ...(payload.codes || {}) };
  work.context = { ...work.context, ...(payload.context || {}) };

  work.description = payload.description ?? work.description;
  work.notes = payload.notes ?? work.notes;

  work.dates = { ...work.dates, ...(payload.dates || {}) };

  work.createdAt = new Date();
  work.updatedAt = new Date();

  works.set(id, work);
  return work;
}

/** Aggiorna un lavoro esistente (PUT-like) */
export function updateWork(id, payload = {}) {
  const existing = getWorkById(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    status: payload.status ?? existing.status,
    codes: { ...existing.codes, ...(payload.codes || {}) },
    context: { ...existing.context, ...(payload.context || {}) },
    description: payload.description ?? existing.description,
    notes: payload.notes ?? existing.notes,
    dates: { ...existing.dates, ...(payload.dates || {}) },
    updatedAt: new Date(),
  };

  works.set(String(id), updated);
  return updated;
}

/** Patch solo status (utile per toggle veloce da dashboard) */
export function patchWorkStatus(id, status) {
  const existing = getWorkById(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    status,
    updatedAt: new Date(),
  };

  works.set(String(id), updated);
  return updated;
}

/** Elimina un lavoro */
export function deleteWork(id) {
  const existed = works.delete(String(id));
  return existed;
}
