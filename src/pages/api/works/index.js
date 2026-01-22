// src/pages/api/works/index.js
import { listWorks, createWork } from "@/server/works.repo.js";

export async function GET({ locals }) {
  const { isAuthenticated, userId } = locals.auth();

  if (!isAuthenticated || !userId) {
    return new Response(JSON.stringify({ ok: false, error: "Non autorizzato" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await listWorks(userId);
  return new Response(JSON.stringify({ ok: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST({ request, locals }) {
  const { isAuthenticated, userId } = locals.auth();

  if (!isAuthenticated || !userId) {
    return new Response(JSON.stringify({ ok: false, error: "Non autorizzato" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await request.json();
    const work = await createWork(userId, payload);

    return new Response(JSON.stringify({ ok: true, data: work }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || "Payload errato." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
