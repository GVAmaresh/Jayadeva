import mongoose from "mongoose";

const actionRecords = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.ObjectId,
    ref: "Report",
    required: true,
  },
  patientId: { type: mongoose.Schema.ObjectId, ref: "Patient", required: true },
});
