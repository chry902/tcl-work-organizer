// src/pages/api/works/[id].js
import {
  getWorkById,
  updateWork,
  patchWorkStatus,
  patchWorkNotes,
  deleteWork,
} from "@/server/works.repo.js";


import { WorkStatus } from "@/models/work.model.js";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function requireAuth(locals) {
  const { isAuthenticated, userId } = locals.auth();
  if (!isAuthenticated || !userId) return null;
  return userId;
}

export async function GET({ params, locals }) {
  const userId = requireAuth(locals);
  if (!userId) return json({ ok: false, error: "Non autorizzato" }, 401);

  const work = await getWorkById(userId, params.id);
  if (!work) return json({ ok: false, error: "Lavoro non trovato." }, 404);

  return json({ ok: true, data: work }, 200);
}

export async function PUT({ params, request, locals }) {
  const userId = requireAuth(locals);
  if (!userId) return json({ ok: false, error: "Non autorizzato" }, 401);

  try {
    const payload = await request.json();
    const updated = await updateWork(userId, params.id, payload);
    if (!updated) return json({ ok: false, error: "Lavoro non trovato." }, 404);

    return json({ ok: true, data: updated }, 200);
  } catch (err) {
    return json({ ok: false, error: err?.message || "JSON non valido." }, 400);
  }
}

/**
 * PATCH: cambia solo lo status
 * Body: { status: "aperto" | "sospeso" | "programmato" | "evaso" }
 */
export async function PATCH({ params, request, locals }) {
  const userId = requireAuth(locals);
  if (!userId) return json({ ok: false, error: "Non autorizzato" }, 401);

  try {
    const payload = await request.json();

    // PATCH status (se presente)
    if (payload?.status !== undefined) {
      const status = payload.status;

      const allowed = new Set(Object.values(WorkStatus));
      if (!allowed.has(status)) {
        return json(
          { ok: false, error: "Status non valido. Usa: aperto | sospeso | programmato | evaso" },
          400
        );
      }

      const updated = await patchWorkStatus(userId, params.id, status);
      if (!updated) return json({ ok: false, error: "Lavoro non trovato." }, 404);
      return json({ ok: true, data: updated }, 200);
    }

    // PATCH notes (se presente)
    if (payload?.notes !== undefined) {
      const notes = payload.notes;

      if (notes !== null && typeof notes !== "string") {
        return json(
          { ok: false, error: "Notes non valide. Deve essere una stringa (o null)." },
          400
        );
      }

      const updated = await patchWorkNotes(userId, params.id, notes ?? "");
      if (!updated) return json({ ok: false, error: "Lavoro non trovato." }, 404);
      return json({ ok: true, data: updated }, 200);
    }

    return json(
      { ok: false, error: "Nessun campo valido per PATCH. Usa {status} o {notes}." },
      400
    );
  } catch (err) {
    return json({ ok: false, error: err?.message || "JSON non valido." }, 400);
  }
}



export async function DELETE({ params, locals }) {
  const userId = requireAuth(locals);
  if (!userId) return json({ ok: false, error: "Non autorizzato" }, 401);

  const ok = await deleteWork(userId, params.id);
  if (!ok) return json({ ok: false, error: "Lavoro non trovato." }, 404);

  return json({ ok: true }, 200);
}
