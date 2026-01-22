import { connectMongo } from "@/server/mongo.js";

export async function GET() {
  try {
    await connectMongo();
    return new Response(JSON.stringify({ ok: true, db: "connected" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || "DB error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
