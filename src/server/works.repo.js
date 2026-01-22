// src/server/works.repo.js
import { connectMongo } from "@/server/mongo.js";
import { Work } from "@/server/models/Work.js";
import { createEmptyWork } from "@/models/work.model.js";

function normalize(work) {
  if (!work) return null;

  // work può essere oggetto lean (plain) o toObject
  const { _id, __v, ...rest } = work;

  return {
    id: _id?.toString?.() ?? String(_id),
    ...rest,
  };
}

export async function listWorks(userId) {
  await connectMongo();
  const rows = await Work.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .lean();
  return rows.map(normalize);
}


export async function getWorkById(userId, id) {
  await connectMongo();
  const work = await Work.findOne({ _id: id, createdBy: userId }).lean();
  return normalize(work);
}


export async function createWork(userId, payload = {}) {
  await connectMongo();

  const w = createEmptyWork();
  w.status = payload.status ?? w.status;
  w.codes = { ...w.codes, ...(payload.codes || {}) };
  w.context = { ...w.context, ...(payload.context || {}) };
  w.description = payload.description ?? w.description;
  w.notes = payload.notes ?? w.notes;
  w.dates = { ...w.dates, ...(payload.dates || {}) };

  const created = await Work.create({
    createdBy: userId, // ✅ salva il proprietario
    status: w.status,
    codes: w.codes,
    context: w.context,
    description: w.description,
    notes: w.notes,
    dates: w.dates,
  });

  return normalize(created.toObject());
}


export async function updateWork(userId, id, payload = {}) {
  await connectMongo();

  const updated = await Work.findOneAndUpdate(
    { _id: id, createdBy: userId },
    {
      ...(payload.status !== undefined ? { status: payload.status } : {}),
      ...(payload.codes ? { codes: payload.codes } : {}),
      ...(payload.context ? { context: payload.context } : {}),
      ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
      ...(payload.dates ? { dates: payload.dates } : {}),
    },
    { new: true }
  ).lean();

  return normalize(updated);
}


export async function patchWorkStatus(userId, id, status) {
  await connectMongo();
  const updated = await Work.findOneAndUpdate(
    { _id: id, createdBy: userId },
    { status },
    { new: true }
  ).lean();

  return normalize(updated);
}

export async function patchWorkNotes(userId, id, notes) {
  await connectMongo();

  const updated = await Work.findOneAndUpdate(
    { _id: id, createdBy: userId },
    { notes },
    { new: true }
  ).lean();

  return normalize(updated);
}


export async function deleteWork(userId, id) {
  await connectMongo();
  const res = await Work.findOneAndDelete({ _id: id, createdBy: userId }).lean();
  return !!res;
}

