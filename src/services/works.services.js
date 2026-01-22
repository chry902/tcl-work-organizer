// src/services/works.service.js

async function parseJson(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // se non è JSON, lo lasciamo com'è
  }
  return { ok: res.ok, status: res.status, data };
}

export async function getWorks() {
  const res = await fetch("/api/works");
  const out = await parseJson(res);
  if (!out.ok) throw new Error(out.data?.error || "Errore GET /api/works");
  return out.data.data; // array works
}

export async function createWork(payload) {
  const res = await fetch("/api/works", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  const out = await parseJson(res);
  if (!out.ok) throw new Error(out.data?.error || "Errore POST /api/works");
  return out.data.data; // work creato
}

export async function updateWork(id, payload) {
  const res = await fetch(`/api/works/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  const out = await parseJson(res);
  if (!out.ok) throw new Error(out.data?.error || "Errore PUT /api/works/:id");
  return out.data.data;
}

export async function patchWorkStatus(id, status) {
  const res = await fetch(`/api/works/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const out = await parseJson(res);
  if (!out.ok) throw new Error(out.data?.error || "Errore PATCH status");
  return out.data.data;
}

export async function patchWorkNotes(id, notes) {
  const res = await fetch(`/api/works/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });

  const out = await parseJson(res);
  if (!out.ok) throw new Error(out.data?.error || "Errore PATCH notes");
  return out.data.data;
}

export async function deleteWork(id) {
  const res = await fetch(`/api/works/${id}`, { method: "DELETE" });
  const out = await parseJson(res);
  if (!out.ok) throw new Error(out.data?.error || "Errore DELETE work");
  return true;
}
