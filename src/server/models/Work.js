import mongoose from "mongoose";

const WorkSchema = new mongoose.Schema(
  {
    createdBy: { type: String, default: "", index: true },

    status: {
      type: String,
      enum: ["aperto", "sospeso", "evaso"],
      default: "aperto",
      required: true,
    },

    codes: {
      avviso: { type: String, default: "" },
      oda: { type: String, default: "" },
      odc: { type: String, default: "" },
      pdl: { type: String, default: "" },
    },

    context: {
      ditta: { type: String, default: "" },
      area: { type: String, default: "" },
      impianto: { type: String, default: "" },
      item: { type: String, default: "" },
    },

    description: { type: String, default: "" },
    notes: { type: String, default: "" },

    dates: {
      start: { type: String, default: null }, // "YYYY-MM-DD" oppure null
      end: { type: String, default: null },   // "YYYY-MM-DD" oppure null
    },
  },
  { timestamps: true } // crea createdAt e updatedAt automatici
);

// Evita errore "Cannot overwrite `Work` model once compiled."
export const Work = mongoose.models.Work || mongoose.model("Work", WorkSchema);
