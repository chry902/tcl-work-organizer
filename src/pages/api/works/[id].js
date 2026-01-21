// src/pages/api/works/[id].js
import {
  getWorkById,
  updateWork,
  patchWorkStatus,
  deleteWork,
} from "@/server/works.store.js";
import { WorkStatus } from "@/models/work.model.js";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET({ params }) {
  const work = getWorkById(params.id);
  if (!work) return json({ ok: false, error: "Lavoro non trovato." }, 404);
  return json({ ok: true, data: work }, 200);
}

export async function PUT({ params, request }) {
  try {
    const payload = await request.json();
    const updated = updateWork(params.id, payload);
    if (!updated) return json({ ok: false, error: "Lavoro non trovato." }, 404);
    return json({ ok: true, data: updated }, 200);
  } catch {
    return json({ ok: false, error: "JSON non valido." }, 400);
  }
}

/**
 * PATCH: usiamolo solo per cambiare lo status velocemente
 * Body atteso: { status: "aperto" | "sospeso" | "evaso" }
 */
export async function PATCH({ params, request }) {
  try {
    const payload = await request.json();
    const status = payload?.status;

    const allowed = new Set(Object.values(WorkStatus));
    if (!allowed.has(status)) {
      return json(
        { ok: false, error: "Status non valido. Usa: aperto | sospeso | evaso" },
        400
      );
    }

    const updated = patchWorkStatus(params.id, status);
    if (!updated) return json({ ok: false, error: "Lavoro non trovato." }, 404);

    return json({ ok: true, data: updated }, 200);
  } catch {
    return json({ ok: false, error: "JSON non valido." }, 400);
  }
}

export async function DELETE({ params }) {
  const ok = deleteWork(params.id);
  if (!ok) return json({ ok: false, error: "Lavoro non trovato." }, 404);
  return json({ ok: true }, 200);
}
