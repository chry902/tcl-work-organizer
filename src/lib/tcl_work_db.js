/**
 * Connessione MongoDB (Mongoose) robusta e riutilizzabile.
 *
 * Perché serve questa struttura?
 * - In DEV (Astro dev + HMR) i file possono essere ricaricati più volte:
 *   senza cache, Mongoose prova a riconnettersi ogni volta → errori / warning / crash.
 * - In PROD vogliamo una singola connessione stabile.
 *
 * Questa implementazione:
 * - Usa una cache globale su globalThis per mantenere 1 sola connessione.
 * - Se la connessione fallisce, resetta la promise così al prossimo tentativo può riprovare.
 * - Espone connectDB() da usare in ogni API prima delle query.
 */

import mongoose from "mongoose";

const MONGODB_URI = import.meta.env.MONGODB_URI 

// ✅ Controllo immediato: se manca la variabile d'ambiente, meglio fallire subito
if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI in .env (es: MONGODB_URI=\"mongodb+srv://...\")"
  );
}

/**
 * Cache globale.
 * Nota: globalThis è disponibile sia in Node che nel runtime server di Astro.
 *
 * La proprietà __mongoose non esiste di default: la creiamo noi.
 */
if (!globalThis.__mongoose) {
  globalThis.__mongoose = {
    conn: null,     // connessione già stabilita
    promise: null,  // promise in corso (per evitare doppie connect simultanee)
  };
}

const cached = globalThis.__mongoose;

/**
 * Connetti MongoDB e ritorna la connessione Mongoose.
 * - Se già connesso, ritorna subito.
 * - Se c'è già una connessione in corso, aspetta quella.
 * - Se fallisce, resetta lo stato e rilancia l’errore.
 */
export async function connectDB() {
  // ✅ Se siamo già connessi, non fare nulla
  if (cached.conn) return cached.conn;

  // ✅ Se non c’è una connessione in corso, la creiamo
  if (!cached.promise) {
    const options = {
      // Forziamo il database giusto per evitare errori "scrivo sul db sbagliato"
      dbName: "tcl_work_db",

      // Impostazioni sane (puoi estenderle in futuro)
      // serverSelectionTimeoutMS: 8000, // se vuoi fallire più velocemente quando Mongo non risponde
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        // ❗ Importantissimo: se fallisce, resettiamo la promise
        // così al prossimo tentativo non rimaniamo "bloccati" in stato rotto.
        cached.promise = null;
        throw err;
      });
  }

  // ✅ Attendiamo la connessione (o quella già in corso)
  cached.conn = await cached.promise;

  // Opzionale: log utile in dev (non in produzione)
  // console.log("✅ MongoDB connected");

  return cached.conn;
}
