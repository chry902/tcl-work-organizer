// src/pages/api/works/index.js
import { listWorks, createWork } from "@/server/works.store.js";

export async function GET() {
  const data = listWorks();
  return new Response(JSON.stringify({ ok: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST({ request }) {
  try {
    const payload = await request.json();
    const work = createWork(payload);

    return new Response(JSON.stringify({ ok: true, data: work }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: "JSON non valido o payload errato." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
