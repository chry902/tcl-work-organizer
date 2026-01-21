// work.model.js

export const WorkStatus = {
  OPEN: "aperto",
  SUSPENDED: "sospeso",
  CLOSED: "evaso",
};

export const createEmptyWork = () => ({
  id: null,

  status: WorkStatus.OPEN,

  codes: {
    avviso: "",
    oda: "",
    odc: "",
    pdl: "",
  },

  context: {
    ditta: "",
    area: "",
    impianto: "",
    item: "",
  },

  description: "",
  notes: "",

  dates: {
    start: null,
    end: null,
  },

  createdAt: new Date(),
  updatedAt: new Date(),
});
